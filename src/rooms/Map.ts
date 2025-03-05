import {
  MyRoomState,
  Obstacle,
  Portal,
  SpawnedLoot,
  SpawnedMonster,
} from "./RoomState";
import { Room, Client } from "colyseus";
import { playerDataManager, PlayerData } from "../playerData";
import { SpawnedPlayer } from "./RoomState";
import { TiledMapParser } from "./TiledMapParser";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { InputData, MonsterInterface } from "../gameObjects";

interface MapOptions {
  path: string;
  monsters: {
    monsterType: MonsterInterface;
    spawnInterval: number;
    maxSpawned: number;
    minSpawned: number;
  }[];
  portals: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    targetRoom: string;
    targetX: number;
    targetY: number;
  }[];
}

export class map extends Room<MyRoomState> {
  private readonly fixedTimeStep = 1000 / 60;
  private lastSpawnTimes: Map<string, number> = new Map();

  onCreate(options: MapOptions) {
    console.log("MAP: Creating map", options);
    this.setState(new MyRoomState());
    this.autoDispose = false;
    const mapData = JSON.parse(fs.readFileSync(options.path, "utf8"));
    this.state.mapWidth = mapData.width * mapData.tilewidth;
    this.state.mapHeight = mapData.height * mapData.tileheight;
    const colliders = TiledMapParser.parseColliders(mapData);
    this.state.obstacles = new Array<Obstacle>();
    colliders.forEach((collider) => {
      const obstacle = new Obstacle(
        uuidv4(),
        collider.x,
        collider.y,
        mapData.tilewidth,
        mapData.tileheight,
        collider.isOneWay
      );
      this.state.obstacles.push(obstacle);
    });

    options.portals.forEach((portal) => {
      this.state.portals.push(
        new Portal(
          portal.id,
          portal.x,
          portal.y,
          portal.width,
          portal.height,
          portal.targetRoom,
          portal.targetX,
          portal.targetY
        )
      );
    });

    this.onMessage(0, (_, input) => {
      //routes input to correct user, based on username
      const player = this.state.spawnedPlayers.find(
        (player) => player.username === input.username
      );
      if (!player) {
        console.warn(
          `MAP: Player not found for input from username: ${input.username}`
        );
        return;
      }
      player.inputQueue.push(input);
    });

    // Add this message handler for loot collection
    this.onMessage("collectLoot", (client) => {
      const username = client.auth.username;
      const player = this.state.spawnedPlayers.find(
        (p) => p.username === username
      );

      if (!player) {
        console.warn(`MAP: Player not found for loot collection: ${username}`);
        return;
      }

      this.handleLootCollection(player);
    });

    // Initialize spawn times for each monster type
    options.monsters.forEach((m) => {
      this.lastSpawnTimes.set(m.monsterType.name, 0);
    });

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);

        const currentTime = Date.now();
        options.monsters.forEach((m) => {
          const lastSpawnTime =
            this.lastSpawnTimes.get(m.monsterType.name) || 0;
          const currentCount = this.state.spawnedMonsters.filter(
            (monster) => monster.name === m.monsterType.name
          ).length;

          // Only spawn if below max AND enough time has passed since last spawn
          if (
            currentCount < m.maxSpawned &&
            currentTime - lastSpawnTime >= m.spawnInterval
          ) {
            console.log("MAP: Spawning monster", m.monsterType.name);

            // Update last spawn time
            this.lastSpawnTimes.set(m.monsterType.name, currentTime);

            // Spawn immediately instead of using setTimeout
            const monster = new SpawnedMonster(
              uuidv4(),
              m.monsterType,
              this.state.mapWidth * 0.2,
              this.state.mapHeight * 0.3
            );
            this.state.spawnedMonsters.push(monster);
          }
        });
      }
    });
  }
  /*
  If onAuth() returns a truthy value, onJoin() is going to be called with the returned value as the third argument.
  If onAuth() returns a falsy value, the client is immediatelly rejected, causing the matchmaking function call from the client-side to fail.
  onAuth is called when the client connects to the server, i.e. when the client calls this.client.join
  */
  async onAuth(
    client: Client,
    options: { username: string; password: string }
  ) {
    console.log("MAP: Auth attempt for user:", options.username);

    if (!options.username || !options.password) {
      throw new Error("Username and password are required");
    }

    const playerData = await playerDataManager.loginPlayer(
      options.username,
      options.password
    );

    if (!playerData) {
      throw new Error("Invalid credentials");
    }

    console.log("MAP: Auth successful for user:", options.username);
    return playerData; // Return the full player data to be used in onJoin
  }

  async onJoin(client: Client, options: any, auth: PlayerData) {
    if (!auth || !auth.username) {
      throw new Error("Authentication data not found");
    }

    console.log("ONJOIN AUTH", auth);

    // Check if this is a portal transition by looking for targetX and targetY in options
    let spawnX = auth.lastX || 100;
    let spawnY = auth.lastY || 100;

    // If options contains portal target coordinates, use those instead
    if (options.targetX !== undefined && options.targetY !== undefined) {
      spawnX = options.targetX;
      spawnY = options.targetY;
      console.log(
        `MAP: Portal transition detected, spawning at ${spawnX}, ${spawnY}`
      );
    }

    // Create a new spawned player with the auth data
    const spawnedPlayer = new SpawnedPlayer(
      uuidv4(),
      auth.username,
      spawnX, // Use the determined spawn position
      spawnY,
      0, // velocityX
      0, // velocityY
      auth.experience,
      auth.level,
      32, // height
      32, // width
      false, // isAttacking
      true, // isGrounded
      []
    );

    this.state.spawnedPlayers.push(spawnedPlayer);
    console.log("MAP: Spawned player", spawnedPlayer.username, "at position:", {
      x: spawnedPlayer.x,
      y: spawnedPlayer.y,
    });
  }

  onLeave(client: Client) {
    console.log("MAP: On leave", client.auth);
    const player = this.state.spawnedPlayers.find(
      (p) => p.username === client.auth.username
    );
    if (player) {
      // Save the player's last position and room before they leave
      playerDataManager.updatePlayerData(player.username, {
        lastRoom: this.roomName,
        lastX: player.x,
        lastY: player.y,
        experience: player.experience,
        level: player.level,
      });

      // Remove the player from the room
      const index = this.state.spawnedPlayers.findIndex(
        (p) => p.username === client.auth.username
      );
      if (index !== -1) {
        this.state.spawnedPlayers.splice(index, 1);
      }
    }
    console.log(
      "MAP: Player left",
      player,
      "NEW STATE",
      this.state.spawnedPlayers
    );
  }

  onDispose() {
    // For when the server has to shut down or restart
  }

  fixedTick(timeStep: number) {
    const horizontalVelocity = 2;
    const gravity = 0.5;
    const jumpVelocity = -12;

    this.state.spawnedPlayers.forEach((player) => {
      let input: InputData;

      //drain input queue
      while ((input = player.inputQueue.shift())) {
        const prevX = player.x;
        const prevY = player.y;

        if (input.attack) {
          player.isAttacking = true;
        } else {
          player.isAttacking = false;
        }

        // Reset velocityX each tick
        player.velocityX = 0;

        if (!player.isAttacking) {
          if (input.left) {
            player.x -= horizontalVelocity;
            player.velocityX = -horizontalVelocity; // Set velocityX negative when moving left
            for (const obstacle of this.state.obstacles) {
              if (this.checkCollision(player, obstacle)) {
                player.x = prevX;
                player.velocityX = 0; // Reset velocityX on collision
                break;
              }
            }
          } else if (input.right) {
            player.x += horizontalVelocity;
            player.velocityX = horizontalVelocity; // Set velocityX positive when moving right
            for (const obstacle of this.state.obstacles) {
              if (this.checkCollision(player, obstacle)) {
                player.x = prevX;
                player.velocityX = 0; // Reset velocityX on collision
                break;
              }
            }
          }

          if (input.jump && player.isGrounded) {
            player.velocityY = jumpVelocity;
            player.isGrounded = false;
          }
        }

        player.velocityY += gravity;
        player.y += player.velocityY;

        player.isGrounded = false;
        for (const obstacle of this.state.obstacles) {
          if (this.checkCollision(player, obstacle)) {
            const playerBottom = prevY + 16; //Y is the center of the player, add 16 to get the bottom edge.
            const obstacleTop = obstacle.y - obstacle.height / 2; // Y coordinate is the center of the obstacle, subtract to get the top edge.

            if (playerBottom <= obstacleTop) {
              player.y = obstacleTop - 16;
              player.velocityY = 0;
              player.isGrounded = true;
            } else {
              player.y = prevY;
              player.velocityY = 0;
            }
            break;
          }
        }

        if (player.isAttacking) {
          const attackRange = 32; // Adjust based on your attack animation
          this.state.spawnedMonsters.forEach((monster) => {
            // Check if monster is in attack range
            const dx = Math.abs(player.x - monster.x);
            const dy = Math.abs(player.y - monster.y);

            if (dx < attackRange && dy < attackRange && !monster.isHit) {
              // Deal damage and mark monster as hit for this attack
              monster.currentHealth -= 100;
              monster.isHit = true;

              // Reset hit state after the attack animation
              setTimeout(() => {
                monster.isHit = false;
              }, 500); // Adjust timing based on your attack animation duration

              // Remove monster if health depleted
              if (monster.currentHealth <= 0) {
                const index = this.state.spawnedMonsters.indexOf(monster);
                if (index !== -1) {
                  // Spawn loot before removing the monster
                  monster.potentialLoot.forEach((loot) => {
                    // Add random velocity for a "pop" effect
                    const randomVelocityX = (Math.random() - 0.5) * 4; // Random between -2 and 2
                    const randomVelocityY = -Math.random() * 3 - 2; // Random between -2 and -5 (upward)

                    const spawnedLoot = new SpawnedLoot(
                      uuidv4(),
                      loot.name,
                      monster.x,
                      monster.y,
                      randomVelocityX,
                      randomVelocityY,
                      loot.width,
                      loot.height,
                      Date.now()
                    );
                    this.state.spawnedLoot.push(spawnedLoot);
                    console.log("LOOT: Added loot", spawnedLoot);
                  });
                  this.state.spawnedMonsters.splice(index, 1);
                  console.log("DEFEATED MONSTER");
                }
              }
            }
          });
        }

        // Handle loot collection
        if (input.loot) {
          this.handleLootCollection(player);
        }
      }
    });

    // Handle monster movement
    const monsterSpeed = 1;

    this.state.spawnedMonsters.forEach((monster) => {
      // Store previous position
      const prevX = monster.x;
      const prevY = monster.y;

      // Move horizontally
      monster.x += monster.velocityX * monsterSpeed;

      // Check horizontal collisions
      let hasCollision = false;
      for (const obstacle of this.state.obstacles) {
        if (this.checkCollision(monster, obstacle)) {
          monster.x = prevX;
          monster.velocityX *= -1; // Reverse direction
          hasCollision = true;
          break;
        }
      }

      // Apply gravity
      monster.velocityY += gravity;
      monster.y += monster.velocityY;

      // Check vertical collisions
      monster.isGrounded = false;
      for (const obstacle of this.state.obstacles) {
        if (this.checkCollision(monster, obstacle)) {
          const monsterBottom = prevY + 16;
          const obstacleTop = obstacle.y - obstacle.height / 2;

          if (monsterBottom <= obstacleTop) {
            // Landing on top of platform
            monster.y = obstacleTop - 16;
            monster.velocityY = 0;
            monster.isGrounded = true;
          } else {
            // Other vertical collisions
            monster.y = prevY;
            monster.velocityY = 0;
          }
          break;
        }
      }
    });

    // Add loot physics update at the end of fixedTick
    this.state.spawnedLoot.forEach((item) => {
      // Store previous position for collision checking
      const prevX = item.x;
      const prevY = item.y;

      // Update position
      item.x += item.velocityX;

      // Check horizontal collisions with obstacles
      for (const obstacle of this.state.obstacles) {
        if (this.checkCollision(item, obstacle)) {
          item.x = prevX;
          item.velocityX *= -0.5; // Bounce with reduced velocity
          break;
        }
      }

      // Apply gravity
      item.velocityY += gravity;
      item.y += item.velocityY;

      // Check vertical collisions with obstacles
      for (const obstacle of this.state.obstacles) {
        if (this.checkCollision(item, obstacle)) {
          if (item.velocityY > 0) {
            // Landing on top
            item.y = obstacle.y - obstacle.height / 2 - 8; // 8 is half of coin size
            item.velocityY *= -0.5; // Bounce with reduced velocity
            item.velocityX *= 0.8; // Add friction
          } else {
            // Hitting from below
            item.y = prevY;
            item.velocityY = 0;
          }
          break;
        }
      }

      // World bounds check (ground)
      if (item.y > this.state.mapHeight - 8) {
        item.y = this.state.mapHeight - 8;
        item.velocityY *= -0.5;
        item.velocityX *= 0.8; // Add friction
      }

      // Optional: Remove coins that have come to rest
      if (Math.abs(item.velocityX) < 0.01 && Math.abs(item.velocityY) < 0.01) {
        item.velocityX = 0;
        item.velocityY = 0;
      }
    });
  }

  private checkCollision(
    entity:
      | SpawnedPlayer
      | SpawnedMonster
      | SpawnedLoot
      | { x: number; y: number },
    obstacle: Obstacle
  ): boolean {
    const entitySize = entity instanceof SpawnedLoot ? 8 : 16; // smaller size for coins
    const obstacleHalfWidth = obstacle.width / 2;
    const obstacleHalfHeight = obstacle.height / 2;

    const obstacleLeft = obstacle.x - obstacleHalfWidth;
    const obstacleRight = obstacle.x + obstacleHalfWidth;
    const obstacleTop = obstacle.y - obstacleHalfHeight;
    const obstacleBottom = obstacle.y + obstacleHalfHeight;

    const entityLeft = entity.x - entitySize;
    const entityRight = entity.x + entitySize;
    const entityTop = entity.y - entitySize;
    const entityBottom = entity.y + entitySize;

    // For one-way platforms, only check collision when entity is above the platform
    if (obstacle.isOneWayPlatform) {
      // Only collide if:
      // 1. Entity is moving downward (has velocityY property and it's positive)
      // 2. Entity's bottom was above the platform's top in the previous frame
      if ("velocityY" in entity) {
        const velocityY = (
          entity as SpawnedPlayer | SpawnedMonster | SpawnedLoot
        ).velocityY;
        if (velocityY >= 0) {
          // Get the previous Y position (stored before applying gravity)
          const prevY = entityBottom - velocityY;
          if (prevY <= obstacleTop) {
            return (
              entityRight > obstacleLeft &&
              entityLeft < obstacleRight &&
              entityBottom > obstacleTop &&
              entityTop < obstacleBottom
            );
          }
        }
      }
      return false;
    }

    // Regular collision check for non-one-way platforms
    return (
      entityRight > obstacleLeft &&
      entityLeft < obstacleRight &&
      entityBottom > obstacleTop &&
      entityTop < obstacleBottom
    );
  }

  // Add this method to handle loot collection
  private handleLootCollection(player: SpawnedPlayer) {
    const collectionRange = 40; // Adjust based on desired pickup range

    // Create a copy of the array to safely modify during iteration
    const lootToCheck = [...this.state.spawnedLoot];

    lootToCheck.forEach((loot) => {
      // Skip if already being collected
      if (loot.isBeingCollected) return;

      // Check if loot is in range
      const dx = Math.abs(player.x - loot.x);
      const dy = Math.abs(player.y - loot.y);

      if (dx < collectionRange && dy < collectionRange) {
        console.log(`MAP: Player ${player.username} collecting loot`);

        // Mark as being collected
        loot.isBeingCollected = true;
        loot.collectedBy = player.username;

        // Add experience to the player
        if (loot.name.includes("Coin")) {
          player.experience += 5; // Adjust experience value as needed

          // Level up logic if needed
          if (player.experience >= player.level * 100) {
            player.level += 1;
          }
        }

        // Remove the loot after a short delay (for collection animation)
        setTimeout(() => {
          const index = this.state.spawnedLoot.indexOf(loot);
          if (index !== -1) {
            this.state.spawnedLoot.splice(index, 1);
          }
        }, 300);
      }
    });
  }
}

//in reality, an attack input is not the same thing as the player attacking.

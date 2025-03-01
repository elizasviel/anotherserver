import { Room, Client } from "colyseus";
import {
  InputData,
  MyRoomState,
  Player,
  Obstacle,
  Monster,
  Loot,
  LootType,
} from "./RoomState";
import { TiledMapParser } from "./TiledMapParser";
import * as fs from "fs";
import * as path from "path";
import { playerRegistry } from "../app.config";
import { PlayerAccount } from "./PlayerAccount";

export class Village extends Room<MyRoomState> {
  fixedTimeStep = 1000 / 60;
  private lastCollectTime: { [sessionId: string]: number } = {};
  private readonly COLLECT_COOLDOWN = 250; // 4 times per second (1000ms / 4). Rate limits the collectLoot message from the client
  private readonly LOOT_LIFETIME = 30000; // 30 seconds in milliseconds

  onCreate(options: any) {
    // Set autoDispose to false using the accessor
    this.autoDispose = false;

    this.setState(new MyRoomState());

    const mapData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../maps/VillageMap.tmj"), "utf8")
    );

    // Set map dimensions based on tilemap
    this.state.mapWidth = mapData.width * mapData.tilewidth;
    this.state.mapHeight = mapData.height * mapData.tileheight;

    // Parse colliders from tilemap
    const colliders = TiledMapParser.parseColliders(mapData);

    // Initialize the obstacles from tilemap colliders
    this.state.obstacles = new Array<Obstacle>();
    colliders.forEach((collider) => {
      const obstacle = new Obstacle();
      obstacle.x = collider.x;
      obstacle.y = collider.y;
      obstacle.width = mapData.tilewidth;
      obstacle.height = mapData.tileheight;
      obstacle.isOneWayPlatform = collider.isOneWay;
      this.state.obstacles.push(obstacle);
    });

    // Update monster spawn logic
    for (let i = 0; i < 5; i++) {
      const spawnPos = {
        x: this.state.mapWidth * 0.2,
        y: this.state.mapHeight * 0.3,
      };
      const monster = new Monster();
      monster.x = spawnPos.x;
      monster.y = spawnPos.y;
      this.state.monsters.push(monster);
    }

    this.onMessage(0, (client, input) => {
      // handle player input
      const player = this.state.players.get(client.sessionId);

      // enqueue input to user input buffer.
      player.inputQueue.push(input);
    });

    // Add message handler for collect attempts
    this.onMessage("collectLoot", (client, message) => {
      const now = Date.now();

      if (
        this.lastCollectTime[client.sessionId] &&
        now - this.lastCollectTime[client.sessionId] < this.COLLECT_COOLDOWN
      ) {
        return;
      }

      this.lastCollectTime[client.sessionId] = now;

      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const COLLECT_RANGE = 100;
      let nearestLoot: Loot = null;
      let nearestDistance = COLLECT_RANGE;

      this.state.loot.forEach((loot, index) => {
        if (!loot.isBeingCollected) {
          const dx = player.x - loot.x;
          const dy = player.y - loot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestLoot = loot;
          }
        }
      });

      if (nearestLoot) {
        nearestLoot.isBeingCollected = true;
        nearestLoot.collectedBy = client.sessionId;

        if (nearestLoot.type === LootType.COIN) {
          player.data.coins += nearestLoot.value;
        }
      }
    });

    // Add message handler for chat messages
    this.onMessage("chat", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // Broadcast the chat message to all clients
      this.broadcast("chat", {
        sender: player.data.name || client.sessionId.substring(0, 6),
        message: typeof message === "string" ? message : message.text,
        sessionId: client.sessionId,
      });
    });

    // Add message handler for player name setting
    this.onMessage("setName", (client, message) => {
      if (message.name && typeof message.name === "string") {
        const player = this.state.players.get(client.sessionId);
        if (player) {
          // Store the player's name in player.data
          player.data.name = message.name;

          // Broadcast the name change to all clients with the sessionId
          this.broadcast("playerNameUpdate", {
            sessionId: client.sessionId,
            name: message.name,
          });

          // Also send a confirmation back to the client who set their name
          client.send("setName", {
            name: message.name,
          });
        }
      }
    });

    // Add message handler for player login
    this.onMessage("login", (client, message) => {
      if (message.username && typeof message.username === "string") {
        const username = message.username.trim();

        if (username.length > 0) {
          // Get player data from account system
          const playerData = PlayerAccount.getPlayerData(username);

          // Update player data in the game
          const player = this.state.players.get(client.sessionId);
          if (player) {
            player.data = playerData;

            // Store username in registry
            playerRegistry.set(client.sessionId, username);

            // Broadcast a system message about the player's login
            this.broadcast("system", {
              message: `Player ${username} has logged in!`,
            });

            // Send login success to client
            client.send("loginSuccess", {
              username: username,
              coins: playerData.coins,
              experience: playerData.experience,
              level: playerData.level,
            });
          }
        }
      }
    });

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }

      // Update loot collection and timeout
      const now = Date.now();
      for (let i = this.state.loot.length - 1; i >= 0; i--) {
        const loot = this.state.loot[i];

        // Remove expired loot
        if (now - loot.spawnTime > this.LOOT_LIFETIME) {
          this.state.loot.splice(i, 1);
          continue;
        }

        // Move collected loot towards player
        if (loot.isBeingCollected) {
          const player = this.state.players.get(loot.collectedBy);
          if (!player) {
            // Player disconnected, remove the loot
            this.state.loot.splice(i, 1);
            continue;
          }

          const dx = player.x - loot.x;
          const dy = player.y - loot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 10) {
            // Close enough to collect
            this.state.loot.splice(i, 1);
            // Here you could add to player's score/inventory
          } else {
            // Move towards player
            const speed = 5;
            const angle = Math.atan2(dy, dx);
            loot.velocityX = Math.cos(angle) * speed;
            loot.velocityY = Math.sin(angle) * speed;
            loot.x += loot.velocityX;
            loot.y += loot.velocityY;
          }
        }
      }
    });
  }

  fixedTick(timeStep: number) {
    const horizontalVelocity = 2;
    const gravity = 0.5;
    const jumpVelocity = -12;

    this.state.players.forEach((player) => {
      let input: InputData;

      while ((input = player.inputQueue.shift())) {
        // Update attack state
        if (input.attack && !player.isAttacking) {
          player.isAttacking = true;
        } else if (!input.attack && player.isAttacking) {
          player.isAttacking = false;
        }

        // Store previous position for direction detection
        const prevX = player.x;
        const prevY = player.y;

        // Only handle movement if not attacking
        if (!player.isAttacking) {
          // Handle horizontal movement
          if (input.left) {
            player.x -= horizontalVelocity;
            player.isFacingLeft = true; // Update facing direction
            // Check horizontal collision
            for (const obstacle of this.state.obstacles) {
              if (this.checkCollision(player, obstacle)) {
                player.x = prevX;
                break;
              }
            }
          } else if (input.right) {
            player.x += horizontalVelocity;
            player.isFacingLeft = false; // Update facing direction
            // Check horizontal collision
            for (const obstacle of this.state.obstacles) {
              if (this.checkCollision(player, obstacle)) {
                player.x = prevX;
                break;
              }
            }
          }

          // Handle jump
          if (input.jump && player.isGrounded) {
            player.velocityY = jumpVelocity;
            player.isGrounded = false;
          }
        }

        // Apply gravity regardless of attack state
        player.velocityY += gravity;
        player.y += player.velocityY;

        // Check vertical collisions
        player.isGrounded = false;
        for (const obstacle of this.state.obstacles) {
          if (this.checkCollision(player, obstacle)) {
            const playerBottom = prevY + 16;
            const obstacleTop = obstacle.y - obstacle.height / 2;

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

        // Handle attack collision with monsters
        if (player.isAttacking) {
          const attackRange = 32; // Adjust based on your attack animation
          this.state.monsters.forEach((monster) => {
            // Check if monster is in attack range
            const dx = Math.abs(player.x - monster.x);
            const dy = Math.abs(player.y - monster.y);

            if (dx < attackRange && dy < attackRange && !monster.isHit) {
              // Deal damage and mark monster as hit for this attack
              monster.health -= 20;
              monster.isHit = true;

              // Reset hit state after the attack animation
              setTimeout(() => {
                monster.isHit = false;
              }, 500); // Adjust timing based on your attack animation duration

              // Remove monster if health depleted
              if (monster.health <= 0) {
                const index = this.state.monsters.indexOf(monster);
                if (index !== -1) {
                  // Spawn loot before removing the monster
                  this.spawnLoot(monster.x, monster.y);
                  this.state.monsters.splice(index, 1);
                }
              }
            }
          });
        }

        player.tick = input.tick;
      }
    });

    // Handle monster movement
    const monsterSpeed = 1;

    this.state.monsters.forEach((monster) => {
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
    this.state.loot.forEach((item) => {
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
    entity: Player | Monster | Loot | { x: number; y: number },
    obstacle: Obstacle
  ): boolean {
    const entitySize = entity instanceof Loot ? 8 : 16; // smaller size for coins
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
        const velocityY = (entity as Player | Monster | Loot).velocityY;
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

  private spawnLoot(x: number, y: number) {
    // Update existing spawnLoot method to include spawnTime
    for (let i = 0; i < 5; i++) {
      const loot = new Loot();
      loot.type = LootType.COIN;
      loot.x = x;
      loot.y = y;
      loot.value = 1;
      loot.spawnTime = Date.now();
      loot.velocityX = (Math.random() - 0.5) * 3;
      loot.velocityY = -Math.random() * 4;
      this.state.loot.push(loot);
    }
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const spawnPos = {
      x: this.state.mapWidth * 0.8,
      y: this.state.mapHeight * 0.3,
    };
    const player = new Player();
    player.x = spawnPos.x;
    player.y = spawnPos.y;

    // Initialize with default player data
    this.state.players.set(client.sessionId, player);

    // Use player name from registry if available
    const username = playerRegistry.get(client.sessionId);
    if (username) {
      // Get player data from account system
      player.data = PlayerAccount.getPlayerData(username);

      // Use player name from data
      const playerName = player.data.name || client.sessionId.substring(0, 6);

      this.broadcast("system", {
        message: `Player ${playerName} has joined the game`,
      });
    } else {
      this.broadcast("system", {
        message: `New player has joined the game`,
      });
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    // Save player data before removing
    const player = this.state.players.get(client.sessionId);
    const username = playerRegistry.get(client.sessionId);

    if (player && username) {
      // Update player account with latest data
      PlayerAccount.updatePlayerData(username, player.data);
    }

    this.state.players.delete(client.sessionId);

    // Get player name from registry
    const playerName = username || client.sessionId.substring(0, 6);

    this.broadcast("system", {
      message: `Player ${playerName} has left the game`,
    });
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}

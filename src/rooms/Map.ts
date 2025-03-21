import {
  MyRoomState,
  Obstacle,
  Portal,
  SpawnedLoot,
  SpawnedMonster,
} from "./RoomState";
import { Room, Client } from "colyseus";
import { playerDataManager, PlayerData } from "../playerData";
import { SpawnedPlayer, Loot } from "./RoomState";
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
    isOneWayPlatform: boolean;
  }[];
}

export class map extends Room<MyRoomState> {
  private readonly fixedTimeStep = 1000 / 60;
  private lastSpawnTimes: Map<string, number> = new Map();
  private monsterSpawnPoints: Array<{ x: number; y: number }> = [];

  onCreate(options: MapOptions) {
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

    // Parse monster spawn points from the map
    this.monsterSpawnPoints = TiledMapParser.parseMonsterSpawnPoints(mapData);
    console.log(
      `Found ${this.monsterSpawnPoints.length} monster spawn points in the map`
    );

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
          portal.targetY,
          portal.isOneWayPlatform
        )
      );
    });

    this.onMessage(0, (_, input) => {
      const player = this.state.spawnedPlayers.find(
        (player) => player.username === input.username
      );
      player.inputQueue.push(input);
    });

    this.onMessage("chat", (client, message) => {
      try {
        this.broadcast("chat", {
          username: client.auth.username,
          text: message.text,
        });
      } catch (error) {
        console.error("MAP: Error broadcasting chat message:", error);
      }
    });

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
            // Update last spawn time
            this.lastSpawnTimes.set(m.monsterType.name, currentTime);

            // Only spawn if we have valid spawn points
            if (this.monsterSpawnPoints.length > 0) {
              // Randomly select a spawn point
              const randomIndex = Math.floor(
                Math.random() * this.monsterSpawnPoints.length
              );
              const spawnPoint = this.monsterSpawnPoints[randomIndex];

              // Spawn monster at the selected point
              // Adjust y position to place monster on top of the tile
              const monster = new SpawnedMonster(
                uuidv4(),
                m.monsterType,
                spawnPoint.x,
                spawnPoint.y - m.monsterType.height / 2
              );
              this.state.spawnedMonsters.push(monster);
            } else {
              // Fallback to default spawn location if no spawn points are defined
              console.warn(
                "No monster spawn points found in map, using default location"
              );
              const monster = new SpawnedMonster(
                uuidv4(),
                m.monsterType,
                this.state.mapWidth * 0.2,
                this.state.mapHeight * 0.3
              );
              this.state.spawnedMonsters.push(monster);
            }
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

    return playerData; // Return the full player data to be used in onJoin
  }

  async onJoin(client: Client, options: any, auth: PlayerData) {
    if (!auth || !auth.username) {
      throw new Error("Authentication data not found");
    }

    // Check if this is a portal transition by looking for targetX and targetY in options
    let spawnX = auth.lastX || 100;
    let spawnY = auth.lastY || 100;

    // If options contains portal target coordinates, use those instead
    if (options.targetX !== undefined && options.targetY !== undefined) {
      spawnX = options.targetX;
      spawnY = options.targetY;
    }

    // Reset any loot items that are marked as being collected
    // This ensures that loot is collectible when a new player joins
    this.state.spawnedLoot.forEach((loot) => {
      if (loot.isBeingCollected) {
        console.log(
          `MAP: Resetting loot item ${loot.id} for new player ${auth.username}`
        );
        loot.isBeingCollected = false;
        loot.collectedBy = null;
      }
    });

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
      true, // canAttack
      true, // canLoot
      true, // canJump
      false, // isAttacking
      0, // lastProcessedTick
      0, // lastDamageTime
      auth.maxHealth,
      auth.maxHealth,
      false, // isInvulnerable
      auth.strength,
      auth.inventory.map((item) => ({
        loot: new Loot(item.loot.name, item.loot.width, item.loot.height),
        quantity: item.quantity,
      })),
      [] // inputQueue
    );
    this.state.spawnedPlayers.push(spawnedPlayer);
  }

  onLeave(client: Client) {
    const player = this.state.spawnedPlayers.find(
      (p) => p.username === client.auth.username
    );
    if (player) {
      // Convert MapSchema inventory back to array format for storage
      const inventoryArray = [];
      player.inventory.forEach((loot, key) => {
        inventoryArray.push({
          loot: loot,
          quantity: player.inventoryQuantities.get(key) || 0,
        });
      });

      // Save the player's last position and room before they leave
      playerDataManager.updatePlayerData(player.username, {
        lastRoom: this.roomName,
        lastX: player.x,
        lastY: player.y,
        experience: player.experience,
        level: player.level,
        strength: player.strength,
        maxHealth: player.maxHealth,
        inventory: inventoryArray,
      });

      // Remove the player from the room
      const index = this.state.spawnedPlayers.findIndex(
        (p) => p.username === client.auth.username
      );
      if (index !== -1) {
        this.state.spawnedPlayers.splice(index, 1);
      }
    }
  }

  onDispose() {
    // For when the server has to shut down or restart
  }

  fixedTick(timeStep: number) {
    const horizontalVelocity = 2;
    const gravity = 0.5;
    const jumpVelocity = -12;

    // Check for player-monster collisions and apply damage
    this.handlePlayerMonsterCollisions();

    this.state.spawnedPlayers.forEach((player) => {
      let input: InputData;

      //drain input queue
      while ((input = player.inputQueue.shift())) {
        // Track the last processed input tick
        if (input.tick > player.lastProcessedTick) {
          player.lastProcessedTick = input.tick;
        }

        const prevX = player.x;
        const prevY = player.y;

        if (input.attack && player.canAttack) {
          const attackRange = 64; // Adjust based on your attack animation

          // Find the closest monster within attack range
          let closestMonster = null;
          let closestDistance = Number.MAX_VALUE;

          this.state.spawnedMonsters.forEach((monster) => {
            // Check if monster is in attack range
            const dx = Math.abs(player.x - monster.x);
            const dy = Math.abs(player.y - monster.y);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (
              distance < attackRange &&
              distance < closestDistance &&
              monster.currentHealth > 0
            ) {
              closestMonster = monster;
              closestDistance = distance;
            }
          });

          // If we found a monster in range, damage it
          if (closestMonster) {
            // Calculate damage based on player's strength
            // Base damage is around 50 with a random factor
            const baseDamage = player.strength * 5;
            const randomFactor = 0.8 + Math.random() * 0.4; // Random between 0.8 and 1.2
            let damage = Math.floor(baseDamage * randomFactor);

            // 5% chance for critical hit (double damage)
            const isCritical = Math.random() < 0.05;
            if (isCritical) {
              damage *= 2;
            }

            closestMonster.currentHealth -= damage;
            this.broadcast("monster-took-damage", {
              monsterId: closestMonster.id,
              damage: damage,
            });
            if (closestMonster.currentHealth <= 0) {
              player.experience += closestMonster.experience;
              // Calculate required XP using an exponential formula
              // This makes leveling progressively harder as level increases
              const requiredXP = Math.floor(
                100 * Math.pow(1.5, player.level - 1)
              );

              if (player.experience >= requiredXP) {
                player.level += 1;
                player.strength += 2;
                player.maxHealth += 10;
                player.currentHealth = player.maxHealth;
                playerDataManager.updatePlayerData(player.username, {
                  level: player.level,
                  experience: player.experience,
                  strength: player.strength,
                  maxHealth: player.maxHealth,
                });

                // Broadcast level up event to all clients
                this.broadcast("player-level-up", {
                  username: player.username,
                  newLevel: player.level,
                });
              }
            }
          }

          player.isAttacking = true;
          player.canAttack = false;

          setTimeout(() => {
            player.canAttack = true;
            player.isAttacking = false;
          }, 500);
        }

        if (input.loot && player.canLoot) {
          player.canLoot = false;
          this.handleLootCollection(player);
          setTimeout(() => {
            player.canLoot = true;
          }, 250);
        }

        // Reset velocityX each tick
        player.velocityX = 0;

        if (!player.isAttacking) {
          if (input.left) {
            player.x -= horizontalVelocity;
            player.velocityX = -horizontalVelocity;
            for (const obstacle of this.state.obstacles) {
              if (this.checkCollision(player, obstacle)) {
                player.x = prevX;
                player.velocityX = 0;
                break;
              }
            }
          } else if (input.right) {
            player.x += horizontalVelocity;
            player.velocityX = horizontalVelocity;
            for (const obstacle of this.state.obstacles) {
              if (this.checkCollision(player, obstacle)) {
                player.x = prevX;
                player.velocityX = 0;
                break;
              }
            }
          }

          if (input.jump && player.canJump) {
            player.velocityY = jumpVelocity;
            player.canJump = false;
          }
        }

        player.velocityY += gravity;
        player.y += player.velocityY;

        // Reset canJump to false before checking collisions
        player.canJump = false;

        for (const obstacle of this.state.obstacles) {
          if (this.checkCollision(player, obstacle)) {
            const playerBottom = prevY + 16;
            const obstacleTop = obstacle.y - obstacle.height / 2;

            if (playerBottom <= obstacleTop) {
              player.y = obstacleTop - 16;
              player.velocityY = 0;
              player.canJump = true;
            } else {
              player.y = prevY;
              player.velocityY = 0;
            }
            break;
          }
        }
      }
    });

    // Handle monster movement
    const monsterSpeed = 1;

    this.state.spawnedMonsters.forEach((monster) => {
      // Remove monster if health depleted
      if (monster.currentHealth <= 0) {
        const index = this.state.spawnedMonsters.indexOf(monster);
        if (index !== -1) {
          // Spawn loot before removing the monster
          this.spawnProbabilisticLoot(monster);
          this.state.spawnedMonsters.splice(index, 1);
        }
        return;
      }

      // Store previous position
      const prevX = monster.x;
      const prevY = monster.y;

      // Add behavior state management
      if (!monster.behaviorState) {
        monster.behaviorState = "idle";
        monster.behaviorTimer = 0;
        monster.behaviorDuration = Math.random() * 3000 + 1000; // 1-4 seconds
      }

      // Update behavior timer
      monster.behaviorTimer += timeStep;

      // Change behavior when timer expires
      if (monster.behaviorTimer >= monster.behaviorDuration) {
        // Choose behaviors based on monster type
        let behaviors: string[];
        let weights: number[];

        if (monster.name.includes("Wolf")) {
          // Wolves only run or idle
          behaviors = ["idle", "run"];
          weights = [0.4, 0.6];
        } else if (monster.name === "Snail") {
          // Snails only walk or idle
          behaviors = ["idle", "walk"];
          weights = [0.6, 0.4];
        } else {
          // Default behavior for other monsters
          behaviors = ["idle", "walk", "run"];
          weights = [0.3, 0.4, 0.3];
        }

        // Weighted random selection
        let random = Math.random();
        let cumulativeWeight = 0;
        let selectedBehavior = "idle";

        for (let i = 0; i < behaviors.length; i++) {
          cumulativeWeight += weights[i];
          if (random <= cumulativeWeight) {
            selectedBehavior = behaviors[i];
            break;
          }
        }

        monster.behaviorState = selectedBehavior;
        monster.behaviorTimer = 0;
        monster.behaviorDuration = Math.random() * 3000 + 1000; // 1-4 seconds

        // Set velocities based on behavior
        switch (monster.behaviorState) {
          case "idle":
            monster.velocityX = 0;
            break;
          case "walk":
            monster.velocityX = Math.random() > 0.5 ? 1 : -1;
            break;
          case "run":
            monster.velocityX = (Math.random() > 0.5 ? 1 : -1) * 2;
            break;
        }
      }

      // Move horizontally based on current behavior
      monster.x += monster.velocityX * monsterSpeed;

      for (const obstacle of this.state.obstacles) {
        if (this.checkCollision(monster, obstacle)) {
          monster.x = prevX;
          monster.velocityX *= -1; // Reverse direction
          break;
        }
      }

      // Apply gravity
      monster.velocityY += gravity;
      monster.y += monster.velocityY;

      // Check vertical collisions
      monster.canJump = false;
      for (const obstacle of this.state.obstacles) {
        if (this.checkCollision(monster, obstacle)) {
          const monsterBottom = prevY + 16;
          const obstacleTop = obstacle.y - obstacle.height / 2;

          if (monsterBottom <= obstacleTop) {
            // Landing on top of platform
            monster.y = obstacleTop - 16;
            monster.velocityY = 0;
            monster.canJump = true;
          } else {
            // Other vertical collisions
            monster.y = prevY;
            monster.velocityY = 0;
          }
          break;
        }
      }

      // Occasionally change direction when idle to look around
      if (monster.behaviorState === "idle" && Math.random() < 0.01) {
        monster.velocityX = monster.velocityX === 0 ? 0 : -monster.velocityX;
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

    // After updating player positions but before sending state
    for (const player of this.state.spawnedPlayers) {
      this.handlePlayerStuckInCollision(player);
    }
  }

  private checkCollision(
    entity:
      | SpawnedPlayer
      | SpawnedMonster
      | SpawnedLoot
      | { x: number; y: number },
    obstacle: Obstacle | SpawnedMonster
  ): boolean {
    const entitySize = entity instanceof SpawnedLoot ? 8 : 16; // smaller size for coins

    // Handle different obstacle types
    let obstacleHalfWidth: number;
    let obstacleHalfHeight: number;
    let isOneWayPlatform = false;

    if ("isOneWayPlatform" in obstacle) {
      obstacleHalfWidth = obstacle.width / 2;
      obstacleHalfHeight = obstacle.height / 2;
      isOneWayPlatform = obstacle.isOneWayPlatform;
    } else {
      // It's a SpawnedMonster
      obstacleHalfWidth = obstacle.width / 2;
      obstacleHalfHeight = obstacle.height / 2;
    }

    const obstacleLeft = obstacle.x - obstacleHalfWidth;
    const obstacleRight = obstacle.x + obstacleHalfWidth;
    const obstacleTop = obstacle.y - obstacleHalfHeight;
    const obstacleBottom = obstacle.y + obstacleHalfHeight;

    const entityLeft = entity.x - entitySize;
    const entityRight = entity.x + entitySize;
    const entityTop = entity.y - entitySize;
    const entityBottom = entity.y + entitySize;

    // For one-way platforms, only check collision when entity is above the platform
    if (isOneWayPlatform) {
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

  // Update the handleLootCollection method to only collect the nearest item
  private handleLootCollection(player: SpawnedPlayer) {
    const collectionRange = 40; // Adjust based on desired pickup range

    // Find all loot items in range
    const lootInRange = this.state.spawnedLoot.filter((loot) => {
      if (loot.isBeingCollected) return false;

      const dx = Math.abs(player.x - loot.x);
      const dy = Math.abs(player.y - loot.y);

      return dx < collectionRange && dy < collectionRange;
    });

    // If no loot in range, return early
    if (lootInRange.length === 0) return;

    // Find the nearest loot item
    let nearestLoot = lootInRange[0];
    let nearestDistance = Math.sqrt(
      Math.pow(player.x - nearestLoot.x, 2) +
        Math.pow(player.y - nearestLoot.y, 2)
    );

    for (let i = 1; i < lootInRange.length; i++) {
      const loot = lootInRange[i];
      const distance = Math.sqrt(
        Math.pow(player.x - loot.x, 2) + Math.pow(player.y - loot.y, 2)
      );

      if (distance < nearestDistance) {
        nearestLoot = loot;
        nearestDistance = distance;
      }
    }

    // Mark as being collected
    nearestLoot.isBeingCollected = true;
    nearestLoot.collectedBy = player.username;

    try {
      // Use the loot name as the key
      const lootId = nearestLoot.name;

      // Check if this type of loot is already in the inventory
      if (player.inventory.has(lootId)) {
        // Increase quantity
        const currentQuantity = player.inventoryQuantities.get(lootId) || 0;
        player.inventoryQuantities.set(lootId, currentQuantity + 1);
      } else {
        // Add new loot to inventory
        const lootItem = new Loot(
          nearestLoot.name,
          nearestLoot.width,
          nearestLoot.height
        );
        player.inventory.set(lootId, lootItem);
        player.inventoryQuantities.set(lootId, 1);
      }
    } catch (error) {
      console.error("Error adding item to inventory:", error);
    }

    // Remove the loot after a short delay (for collection animation)
    setTimeout(() => {
      const index = this.state.spawnedLoot.indexOf(nearestLoot);
      if (index !== -1) {
        this.state.spawnedLoot.splice(index, 1);
      }
    }, 100);
  }

  private handlePlayerMonsterCollisions() {
    const touchDamage = 10;
    const knockbackForce = 5;
    const invulnerabilityDuration = 1000;
    const now = Date.now();

    this.state.spawnedPlayers.forEach((player) => {
      // Skip if player is invulnerable or attacking
      if (player.isInvulnerable || player.isAttacking) {
        return;
      }

      this.state.spawnedMonsters.forEach((monster) => {
        // Skip dead monsters
        if (monster.currentHealth <= 0) {
          return;
        }
        // Check collision between player and monster
        if (this.checkCollision(player, monster)) {
          // Apply damage to player
          player.currentHealth -= touchDamage;

          // Set invulnerability
          player.isInvulnerable = true;
          setTimeout(() => {
            player.isInvulnerable = false;
          }, invulnerabilityDuration);

          // Apply knockback based on relative positions
          const knockbackDirectionX = player.x < monster.x ? -1 : 1;
          player.velocityX = knockbackForce * knockbackDirectionX;
          player.velocityY = -knockbackForce / 2; // Small upward knockback

          // Move player immediately to avoid getting stuck in monster
          player.x += player.velocityX;
          player.y += player.velocityY;

          // Check if player is dead (health <= 0)
          if (player.currentHealth <= 0) {
            // Reset player health and position (respawn)
            player.currentHealth = player.maxHealth;
            // Find a safe spawn point - for now just use initial position
            player.x = 100;
            player.y = 100;
          }
        }
      });
    });
  }

  // Add this new method for probabilistic loot spawning
  private spawnProbabilisticLoot(monster: SpawnedMonster) {
    // Base number of loot items to spawn (can be adjusted based on monster type/level)
    const baseItemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items

    // If monster has potential loot
    if (monster.potentialLoot && monster.potentialLoot.length > 0) {
      for (let i = 0; i < baseItemCount; i++) {
        // Select a random loot item from the potential loot array
        const randomIndex = Math.floor(
          Math.random() * monster.potentialLoot.length
        );
        const selectedLoot = monster.potentialLoot[randomIndex];

        // Add random velocity for a "pop" effect
        const randomVelocityX = (Math.random() - 0.5) * 4; // Random between -2 and 2
        const randomVelocityY = -Math.random() * 3 - 2; // Random between -2 and -5 (upward)

        // Slightly randomize position to avoid all loot spawning at exact same spot
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 10;

        const spawnedLoot = new SpawnedLoot(
          uuidv4(),
          selectedLoot.name,
          monster.x + offsetX,
          monster.y + offsetY,
          randomVelocityX,
          randomVelocityY,
          selectedLoot.width,
          selectedLoot.height,
          Date.now()
        );

        this.state.spawnedLoot.push(spawnedLoot);
      }
    }
  }

  private handlePlayerStuckInCollision(player: SpawnedPlayer) {
    // Check if player is stuck in any obstacle
    for (const obstacle of this.state.obstacles) {
      if (this.checkCollision(player, obstacle)) {
        // Calculate push direction (away from center of obstacle)
        const pushX = player.x - obstacle.x;
        const pushY = player.y - obstacle.y;

        // Normalize and apply push
        const magnitude = Math.sqrt(pushX * pushX + pushY * pushY);
        if (magnitude > 0) {
          const pushDistance =
            player.width / 2 + obstacle.width / 2 - magnitude + 5; // Add a small buffer
          player.x += (pushX / magnitude) * pushDistance;
          player.y += (pushY / magnitude) * pushDistance;
        } else {
          // If directly on top, push upward
          player.y -= player.height / 2 + obstacle.height / 2 + 5;
        }
      }
    }
  }
}

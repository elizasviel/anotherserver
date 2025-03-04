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
  portals?: {
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

  onCreate(options: MapOptions) {
    console.log("MAP: Creating map", options);
    this.setState(new MyRoomState());
    this.autoDispose = false;
    const mapData = JSON.parse(fs.readFileSync(options.path, "utf8"));

    this.state.mapWidth = mapData.width * mapData.tilewidth;
    this.state.mapHeight = mapData.height * mapData.tileheight;

    const colliders = TiledMapParser.parseColliders(mapData);

    this.state.obstacles = new Array<Obstacle>();
    // Initialize obstacles
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

    console.log("MAP: Obstacles", this.state.obstacles);

    // Initialize portals if provided
    if (options.portals) {
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
    }

    console.log("MAP: Portals", this.state.portals);

    this.onMessage(0, (_, input) => {
      const player = this.state.spawnedPlayers.find(
        (player) => player.username === input.username
      );
      player.inputQueue.push(input);
      console.log("MAP: Player input", input);
    });

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });
  }

  async onAuth(
    client: Client,
    options: { username: string; password: string }
  ) {
    const playerData = await playerDataManager.loginPlayer(
      options.username,
      options.password
    );
    if (!playerData) {
      throw new Error("Invalid credentials");
    }
    return { username: options.username };
    console.log("MAP: Auth successful", playerData);
  }

  async onJoin(client: Client, options: any, auth: { username: string }) {
    const playerData = await playerDataManager.getPlayerData(auth.username);
    if (!playerData) {
      throw new Error("Player data not found");
    }

    // Create a new spawned player with the persisted data
    const spawnedPlayer = new SpawnedPlayer(
      client.sessionId,
      auth.username,
      playerData.lastX || 100, // Default spawn position
      playerData.lastY || 100,
      0, // velocityX
      0, // velocityY
      playerData.experience,
      playerData.level,
      32, // height
      32, // width
      Date.now(),
      false, // isAttacking
      true, // isGrounded
      []
    );

    this.state.spawnedPlayers.push(spawnedPlayer);
    console.log(
      "MAP: Spawned player",
      spawnedPlayer,
      "NEW STATE",
      this.state.spawnedPlayers
    );
  }

  onLeave(client: Client) {
    const player = this.state.spawnedPlayers.find(
      (p) => p.id === client.sessionId
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
        (p) => p.id === client.sessionId
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
    // Clean up any room-specific resources
  }

  fixedTick(timeStep: number) {
    const horizontalVelocity = 2;
    const gravity = 0.5;
    const jumpVelocity = -12;

    this.state.spawnedPlayers.forEach((player) => {
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

            // Check horizontal collision
            for (const obstacle of this.state.obstacles) {
              if (this.checkCollision(player, obstacle)) {
                player.x = prevX;
                break;
              }
            }
          } else if (input.right) {
            player.x += horizontalVelocity;
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
}

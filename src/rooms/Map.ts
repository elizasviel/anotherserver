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

    console.log("MAP: Portals", this.state.portals);

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

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
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

        console.log(
          "MAP: Player",
          player.username,
          "is attacking:",
          input.attack
        );

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

//in reality, an attack input is not the same thing as the player attacking.

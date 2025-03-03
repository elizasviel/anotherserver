"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = void 0;
const colyseus_1 = require("colyseus");
const RoomState_1 = require("./RoomState");
const gameObjects_1 = require("../gameObjects");
const TiledMapParser_1 = require("./TiledMapParser");
const app_config_1 = require("../app.config");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
class map extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.fixedTimeStep = 1000 / 60;
        this.COLLECT_COOLDOWN = 250;
        this.LOOT_LIFETIME = 30000;
        this.lastCollectTime = {};
    }
    onCreate(options) {
        const { path, monsters } = options;
        this.autoDispose = false;
        this.setState(new RoomState_1.MyRoomState());
        const mapData = JSON.parse(fs.readFileSync(path, "utf8"));
        this.state.mapWidth = mapData.width * mapData.tilewidth;
        this.state.mapHeight = mapData.height * mapData.tileheight;
        const colliders = TiledMapParser_1.TiledMapParser.parseColliders(mapData);
        this.state.obstacles = new Array();
        colliders.forEach((collider) => {
            const obstacle = new RoomState_1.Obstacle((0, uuid_1.v4)(), collider.x, collider.y, mapData.tilewidth, mapData.tileheight, collider.isOneWay);
            this.state.obstacles.push(obstacle);
        });
        this.onMessage(0, (client, input) => {
            const player = this.state.spawnedPlayers.get(client.sessionId);
            player.inputQueue.push(input);
        });
        this.onMessage("collectLoot", (client, _) => {
            const now = Date.now();
            if (this.lastCollectTime[client.sessionId] &&
                now - this.lastCollectTime[client.sessionId] < this.COLLECT_COOLDOWN) {
                return;
            }
            this.lastCollectTime[client.sessionId] = now;
            const player = this.state.spawnedPlayers.get(client.sessionId);
            if (!player)
                return;
            const COLLECT_RANGE = 100;
            let nearestLoot = null;
            let nearestDistance = COLLECT_RANGE;
            this.state.loot.forEach((loot, _) => {
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
                player.inventory.push(nearestLoot);
            }
        });
        // Add message handler for chat messages
        this.onMessage("chat", (client, message) => {
            const player = this.state.spawnedPlayers.get(client.sessionId);
            if (!player)
                return;
            // Broadcast the chat message to all clients
            this.broadcast("chat", {
                sender: player.name || client.sessionId.substring(0, 6),
                message: typeof message === "string" ? message : message.text,
                sessionId: client.sessionId,
            });
        });
        // Add message handler for player name setting
        this.onMessage("setName", (client, message) => {
            if (message.name && typeof message.name === "string") {
                const player = this.state.spawnedPlayers.get(client.sessionId);
                if (player) {
                    player.name = message.name;
                    this.broadcast("playerNameUpdate", {
                        sessionId: client.sessionId,
                        name: message.name,
                    });
                    client.send("setName", {
                        name: message.name,
                    });
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
                    const player = this.state.spawnedPlayers.get(loot.collectedBy);
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
                    }
                    else {
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
    fixedTick(timeStep) {
        const horizontalVelocity = 2;
        const gravity = 0.5;
        const jumpVelocity = -12;
        this.state.spawnedPlayers.forEach((player) => {
            let input;
            while ((input = player.inputQueue.shift())) {
                // Update attack state
                if (input.attack && !player.isAttacking) {
                    player.isAttacking = true;
                }
                else if (!input.attack && player.isAttacking) {
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
                    }
                    else if (input.right) {
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
                        }
                        else {
                            player.y = prevY;
                            player.velocityY = 0;
                        }
                        break;
                    }
                }
                // Handle attack collision with monsters
                if (player.isAttacking) {
                    const attackRange = 32; // Adjust based on your attack animation
                    this.state.spawnedMonsters.forEach((monster) => {
                        // Check if monster is in attack range
                        const dx = Math.abs(player.x - monster.x);
                        const dy = Math.abs(player.y - monster.y);
                        if (dx < attackRange && dy < attackRange && !monster.isHit) {
                            // Deal damage and mark monster as hit for this attack
                            monster.currentHealth -= 20;
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
                                    this.spawnLoot(monster.x, monster.y);
                                    this.state.spawnedMonsters.splice(index, 1);
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
                    }
                    else {
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
                    }
                    else {
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
    checkCollision(entity, obstacle) {
        const entitySize = entity instanceof RoomState_1.SpawnedLoot ? 8 : 16; // smaller size for coins
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
                const velocityY = entity.velocityY;
                if (velocityY >= 0) {
                    // Get the previous Y position (stored before applying gravity)
                    const prevY = entityBottom - velocityY;
                    if (prevY <= obstacleTop) {
                        return (entityRight > obstacleLeft &&
                            entityLeft < obstacleRight &&
                            entityBottom > obstacleTop &&
                            entityTop < obstacleBottom);
                    }
                }
            }
            return false;
        }
        // Regular collision check for non-one-way platforms
        return (entityRight > obstacleLeft &&
            entityLeft < obstacleRight &&
            entityBottom > obstacleTop &&
            entityTop < obstacleBottom);
    }
    spawnLoot(x, y) {
        // Update existing spawnLoot method to include spawnTime
        for (let i = 0; i < 5; i++) {
            const loot = new RoomState_1.SpawnedLoot((0, uuid_1.v4)(), gameObjects_1.LOOT_TYPES.smallCoin.name, x, y, (Math.random() - 0.5) * 3, -Math.random() * 4, gameObjects_1.LOOT_TYPES.smallCoin.width, gameObjects_1.LOOT_TYPES.smallCoin.height, Date.now());
            this.state.loot.push(loot);
        }
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
        const player = new RoomState_1.SpawnedPlayer(client.sessionId, "Player", this.state.mapWidth * 0.8, this.state.mapHeight * 0.3, 0, 0, 0, 1, this.state.mapWidth * 0.8, this.state.mapHeight * 0.3, [], Date.now(), false, false, []);
        // Initialize with default player data
        this.state.spawnedPlayers.set(client.sessionId, player);
        // Use player name from registry if available
        const username = app_config_1.playerRegistry.get(client.sessionId);
        if (username) {
            // Get player data from account system
            player.name = username;
            // Use player name from data
            const playerName = player.name || client.sessionId.substring(0, 6);
            this.broadcast("system", {
                message: `Player ${playerName} has joined the game`,
            });
        }
        else {
            this.broadcast("system", {
                message: `New player has joined the game`,
            });
        }
    }
    onLeave() { }
    onDispose() { }
}
exports.map = map;

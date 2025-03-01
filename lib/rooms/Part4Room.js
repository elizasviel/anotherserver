"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Part4Room = void 0;
const colyseus_1 = require("colyseus");
const Part4State_1 = require("./Part4State");
class Part4Room extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.fixedTimeStep = 1000 / 60;
    }
    onCreate(options) {
        this.setState(new Part4State_1.MyRoomState());
        // set larger map dimensions
        this.state.mapWidth = 2400;
        this.state.mapHeight = 1200;
        // Create floor and platforms with more interesting layout
        const obstacles = [
            // Main floor
            { x: 1200, y: 1180, width: 2400, height: 40 },
            // Left side platforms
            { x: 200, y: 900, width: 300, height: 20 },
            { x: 500, y: 750, width: 200, height: 20 },
            { x: 200, y: 600, width: 250, height: 20 },
            // Central platforms
            { x: 800, y: 850, width: 150, height: 20 },
            { x: 1200, y: 700, width: 400, height: 20 },
            { x: 1000, y: 500, width: 200, height: 20 },
            { x: 1400, y: 500, width: 200, height: 20 },
            // Right side platforms
            { x: 1800, y: 900, width: 300, height: 20 },
            { x: 2000, y: 700, width: 250, height: 20 },
            { x: 1700, y: 600, width: 200, height: 20 },
            // High platforms
            { x: 600, y: 350, width: 150, height: 20 },
            { x: 1200, y: 300, width: 300, height: 20 },
            { x: 1800, y: 350, width: 150, height: 20 },
            // Floating islands at the top
            { x: 400, y: 150, width: 200, height: 20 },
            { x: 1200, y: 100, width: 250, height: 20 },
            { x: 2000, y: 150, width: 200, height: 20 },
        ];
        // Initialize the obstacles
        this.state.obstacles = new Array();
        obstacles.forEach((obs) => {
            const obstacle = new Part4State_1.Obstacle();
            // Use the coordinates directly since they're already center-based
            obstacle.x = obs.x;
            obstacle.y = obs.y;
            obstacle.width = obs.width;
            obstacle.height = obs.height;
            this.state.obstacles.push(obstacle);
        });
        this.onMessage(0, (client, input) => {
            // handle player input
            const player = this.state.players.get(client.sessionId);
            // enqueue input to user input buffer.
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
    fixedTick(timeStep) {
        const horizontalVelocity = 2;
        const gravity = 0.5;
        const jumpVelocity = -12;
        this.state.players.forEach((player) => {
            let input;
            while ((input = player.inputQueue.shift())) {
                // Store previous position for collision checking
                const prevX = player.x;
                const prevY = player.y;
                // Horizontal movement
                if (input.left) {
                    player.x -= horizontalVelocity;
                }
                else if (input.right) {
                    player.x += horizontalVelocity;
                }
                // Apply jump if grounded
                if (input.jump && player.isGrounded) {
                    player.velocityY = jumpVelocity;
                    player.isGrounded = false;
                }
                // Apply gravity
                player.velocityY += gravity;
                player.y += player.velocityY;
                // Check collisions with obstacles
                let hasCollision = false;
                player.isGrounded = false; // Reset grounded state
                for (const obstacle of this.state.obstacles) {
                    if (this.checkCollision(player, obstacle)) {
                        hasCollision = true;
                        // Determine collision side
                        const playerBottom = prevY + 16;
                        const obstacleTop = obstacle.y - obstacle.height / 2;
                        if (playerBottom <= obstacleTop) {
                            // Landing on top of platform
                            player.y = obstacleTop - 16; // Place player on top
                            player.velocityY = 0;
                            player.isGrounded = true;
                        }
                        else {
                            // Other collisions - revert position
                            player.x = prevX;
                            player.y = prevY;
                            player.velocityY = 0;
                        }
                        break;
                    }
                }
                player.tick = input.tick;
            }
        });
    }
    checkCollision(player, obstacle) {
        // Calculate obstacle boundaries from center (already center-based)
        const obstacleLeft = obstacle.x - obstacle.width / 2;
        const obstacleRight = obstacle.x + obstacle.width / 2;
        const obstacleTop = obstacle.y - obstacle.height / 2;
        const obstacleBottom = obstacle.y + obstacle.height / 2;
        // Calculate player boundaries (assuming player is 32x32)
        const playerLeft = player.x - 16;
        const playerRight = player.x + 16;
        const playerTop = player.y - 16;
        const playerBottom = player.y + 16;
        // AABB collision check
        return (playerRight > obstacleLeft &&
            playerLeft < obstacleRight &&
            playerBottom > obstacleTop &&
            playerTop < obstacleBottom);
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
        const player = new Part4State_1.Player();
        player.x = Math.random() * this.state.mapWidth;
        player.y = Math.random() * this.state.mapHeight;
        this.state.players.set(client.sessionId, player);
    }
    onLeave(client, consented) {
        console.log(client.sessionId, "left!");
        this.state.players.delete(client.sessionId);
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
exports.Part4Room = Part4Room;

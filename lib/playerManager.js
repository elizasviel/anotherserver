"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
const schema_1 = require("@colyseus/schema");
// Singleton to manage persistent player data across rooms
class PlayerManager {
    constructor() {
        this.players = new Map();
    }
    static getInstance() {
        if (!PlayerManager.instance) {
            PlayerManager.instance = new PlayerManager();
        }
        return PlayerManager.instance;
    }
    // Store player data when they leave a room or transfer between rooms
    storePlayerData(playerId, playerData) {
        this.players.set(playerId, Object.assign(Object.assign({}, playerData), { inventory: new schema_1.MapSchema(Object.fromEntries(playerData.inventory)) }));
    }
    // Retrieve player data when they join a new room
    getPlayerData(playerId) {
        return this.players.get(playerId);
    }
    // Check if we have data for this player
    hasPlayerData(playerId) {
        return this.players.has(playerId);
    }
    // Remove player data when they disconnect from the game
    removePlayerData(playerId) {
        this.players.delete(playerId);
    }
}
exports.PlayerManager = PlayerManager;

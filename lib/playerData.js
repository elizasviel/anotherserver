"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerDataManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PlayerDataManager {
    constructor() {
        this.dataPath = "./data/players.json";
        this.players = new Map();
        this.loadData();
    }
    static getInstance() {
        if (!PlayerDataManager.instance) {
            PlayerDataManager.instance = new PlayerDataManager();
        }
        return PlayerDataManager.instance;
    }
    loadData() {
        try {
            if (!fs_1.default.existsSync(path_1.default.dirname(this.dataPath))) {
                fs_1.default.mkdirSync(path_1.default.dirname(this.dataPath), { recursive: true });
            }
            if (fs_1.default.existsSync(this.dataPath)) {
                const data = JSON.parse(fs_1.default.readFileSync(this.dataPath, "utf-8"));
                this.players = new Map(Object.entries(data));
            }
            else {
                console.log("MANAGER: No player data file found at:", this.dataPath);
            }
        }
        catch (error) {
            console.error("MANAGER: Error loading player data:", error);
        }
    }
    saveData() {
        try {
            const data = Object.fromEntries(this.players);
            fs_1.default.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error("MANAGER: Error saving player data:", error);
        }
    }
    async registerPlayer(username, password) {
        if (this.players.has(username)) {
            return false;
        }
        const playerData = {
            username,
            password,
            experience: 0,
            level: 1,
            lastRoom: "field",
            lastX: 0,
            lastY: 0,
            strength: 10,
            maxHealth: 100,
            inventory: [],
        };
        this.players.set(username, playerData);
        this.saveData();
        return true;
    }
    async loginPlayer(username, password) {
        const playerData = this.players.get(username);
        if (!playerData || playerData.password !== password) {
            return null;
        }
        return playerData;
    }
    async updatePlayerData(username, data) {
        const playerData = this.players.get(username);
        if (!playerData) {
            return false;
        }
        Object.assign(playerData, data);
        this.saveData();
        return true;
    }
    async getPlayerData(username) {
        const playerData = this.players.get(username);
        return playerData || null;
    }
}
exports.playerDataManager = PlayerDataManager.getInstance();
//Persists player data including username and passwords

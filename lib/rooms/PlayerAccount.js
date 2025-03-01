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
exports.PlayerAccount = void 0;
const RoomState_1 = require("./RoomState");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Map to store player accounts in memory
const playerAccounts = new Map();
const ACCOUNTS_FILE = path.join(__dirname, "../data/player-accounts.json");
// Ensure data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
// Load accounts from file on startup
try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
        const data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf8"));
        for (const [username, accountData] of Object.entries(data)) {
            const playerData = new RoomState_1.PlayerData();
            Object.assign(playerData, accountData);
            playerAccounts.set(username, playerData);
        }
        console.log(`Loaded ${playerAccounts.size} player accounts`);
    }
}
catch (error) {
    console.error("Error loading player accounts:", error);
}
// Save accounts to file periodically
setInterval(() => {
    saveAccountsToFile();
}, 60000); // Save every minute
// Save accounts when the process exits
process.on("SIGINT", () => {
    console.log("Saving player accounts before exit...");
    saveAccountsToFile();
    process.exit(0);
});
function saveAccountsToFile() {
    try {
        const data = {};
        playerAccounts.forEach((playerData, username) => {
            data[username] = {
                name: playerData.name,
                coins: playerData.coins,
                experience: playerData.experience,
                level: playerData.level,
            };
        });
        fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2));
        console.log(`Saved ${playerAccounts.size} player accounts to file`);
    }
    catch (error) {
        console.error("Error saving player accounts:", error);
    }
}
class PlayerAccount {
    static getPlayerData(username) {
        // If account exists, return it
        if (playerAccounts.has(username)) {
            return playerAccounts.get(username);
        }
        // Otherwise create a new account
        const playerData = new RoomState_1.PlayerData();
        playerData.name = username;
        playerAccounts.set(username, playerData);
        // Save immediately when a new account is created
        saveAccountsToFile();
        return playerData;
    }
    static updatePlayerData(username, playerData) {
        playerAccounts.set(username, playerData);
    }
}
exports.PlayerAccount = PlayerAccount;

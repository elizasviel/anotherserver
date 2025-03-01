import { PlayerData } from "./RoomState";
import * as fs from "fs";
import * as path from "path";

// Map to store player accounts in memory
const playerAccounts: Map<string, PlayerData> = new Map();
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
      const playerData = new PlayerData();
      Object.assign(playerData, accountData);
      playerAccounts.set(username, playerData);
    }
    console.log(`Loaded ${playerAccounts.size} player accounts`);
  }
} catch (error) {
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
  } catch (error) {
    console.error("Error saving player accounts:", error);
  }
}

export class PlayerAccount {
  static getPlayerData(username: string): PlayerData {
    // If account exists, return it
    if (playerAccounts.has(username)) {
      return playerAccounts.get(username);
    }

    // Otherwise create a new account
    const playerData = new PlayerData();
    playerData.name = username;
    playerAccounts.set(username, playerData);

    // Save immediately when a new account is created
    saveAccountsToFile();

    return playerData;
  }

  static updatePlayerData(username: string, playerData: PlayerData) {
    playerAccounts.set(username, playerData);
  }
}

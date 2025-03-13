import fs from "fs";
import path from "path";
import { LootInterface } from "./gameObjects";
export interface PlayerData {
  username: string;
  password: string;
  experience: number;
  level: number;
  lastRoom: string;
  lastX: number;
  lastY: number;
  strength: number;
  maxHealth: number;
  inventory: { loot: LootInterface; quantity: number }[];
}

class PlayerDataManager {
  private static instance: PlayerDataManager;
  private dataPath: string;
  private players: Map<string, PlayerData>;

  private constructor() {
    this.dataPath = "./data/players.json";
    this.players = new Map();
    this.loadData();
  }

  public static getInstance(): PlayerDataManager {
    if (!PlayerDataManager.instance) {
      PlayerDataManager.instance = new PlayerDataManager();
    }
    return PlayerDataManager.instance;
  }

  private loadData() {
    try {
      if (!fs.existsSync(path.dirname(this.dataPath))) {
        fs.mkdirSync(path.dirname(this.dataPath), { recursive: true });
      }

      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, "utf-8"));
        this.players = new Map(Object.entries(data));
      } else {
        console.log("MANAGER: No player data file found at:", this.dataPath);
      }
    } catch (error) {
      console.error("MANAGER: Error loading player data:", error);
    }
  }

  private saveData() {
    try {
      const data = Object.fromEntries(this.players);
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("MANAGER: Error saving player data:", error);
    }
  }

  public async registerPlayer(
    username: string,
    password: string
  ): Promise<boolean> {
    if (this.players.has(username)) {
      return false;
    }

    const playerData: PlayerData = {
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

  public async loginPlayer(
    username: string,
    password: string
  ): Promise<PlayerData | null> {
    const playerData = this.players.get(username);
    if (!playerData || playerData.password !== password) {
      return null;
    }
    return playerData;
  }

  public async updatePlayerData(
    username: string,
    data: Partial<PlayerData>
  ): Promise<boolean> {
    const playerData = this.players.get(username);
    if (!playerData) {
      return false;
    }

    Object.assign(playerData, data);
    this.saveData();
    return true;
  }

  public async getPlayerData(username: string): Promise<PlayerData | null> {
    const playerData = this.players.get(username);
    return playerData || null;
  }
}

export const playerDataManager = PlayerDataManager.getInstance();

//Persists player data including username and passwords

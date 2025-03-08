import fs from "fs";
import path from "path";

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
        console.log(
          "MANAGER: Loaded player data:",
          Object.fromEntries(this.players)
        );
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
      console.log("MANAGER: Saved player data:", data);
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
    };

    this.players.set(username, playerData);
    this.saveData();
    console.log("MANAGER: Registered player:", playerData);
    return true;
  }

  public async loginPlayer(
    username: string,
    password: string
  ): Promise<PlayerData | null> {
    console.log("MANAGER: Logging in player:", username, password);
    const playerData = this.players.get(username);
    if (!playerData || playerData.password !== password) {
      console.log("MANAGER: Invalid credentials");
      return null;
    }
    console.log("MANAGER: Logged in player:", playerData);
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
    console.log("MANAGER: Updated player data:", playerData);
    return true;
  }

  public async getPlayerData(username: string): Promise<PlayerData | null> {
    const playerData = this.players.get(username);
    console.log("MANAGER: Retrieved player data:", playerData);
    return playerData || null;
  }
}

export const playerDataManager = PlayerDataManager.getInstance();

//Persists player data including username and passwords

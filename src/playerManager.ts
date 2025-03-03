import { MapSchema } from "@colyseus/schema";
import { LootInterface } from "./gameObjects";

// Interface for persistent player data
export interface PlayerData {
  id: string;
  username: string;
  experience: number;
  level: number;
  inventory: MapSchema<number>; // Changed from LootInterface[] to MapSchema<number>
}

// Singleton to manage persistent player data across rooms
export class PlayerManager {
  private static instance: PlayerManager;
  private players: Map<string, PlayerData> = new Map();

  private constructor() {}

  public static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }

  // Store player data when they leave a room or transfer between rooms
  public storePlayerData(playerId: string, playerData: PlayerData): void {
    this.players.set(playerId, {
      ...playerData,
      inventory: new MapSchema<number>(
        Object.fromEntries(playerData.inventory)
      ),
    });
  }

  // Retrieve player data when they join a new room
  public getPlayerData(playerId: string): PlayerData | undefined {
    return this.players.get(playerId);
  }

  // Check if we have data for this player
  public hasPlayerData(playerId: string): boolean {
    return this.players.has(playerId);
  }

  // Remove player data when they disconnect from the game
  public removePlayerData(playerId: string): void {
    this.players.delete(playerId);
  }
}

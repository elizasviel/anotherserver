import { Schema, Context, type, MapSchema } from "@colyseus/schema";

export interface InputData {
  left: false;
  right: false;
  up: false;
  down: false;
  jump: false;
  attack: false;
  tick: number;
}

export class PlayerData extends Schema {
  @type("string") name: string = "";
  @type("number") coins: number = 0;
  @type("number") experience: number = 0;
  @type("number") level: number = 1;
  // Add other persistent player data here
}

export class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityY: number = 0;
  @type("number") tick: number;
  @type("boolean") isAttacking: boolean = false;
  @type("boolean") isGrounded: boolean = false;
  @type("boolean") isFacingLeft: boolean = false;
  @type("number") height: number = 32;
  @type(PlayerData) data = new PlayerData();

  inputQueue: InputData[] = [];
}

export class Obstacle extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") width: number;
  @type("number") height: number;
  @type("boolean") isOneWayPlatform: boolean = false;
}

export class Monster extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number = 1; // Initial movement direction
  @type("number") velocityY: number = 0;
  @type("boolean") isGrounded: boolean = false;
  @type("number") health: number = 100;
  @type("boolean") isHit: boolean = false;
  @type("number") height: number = 32;
  @type("number") patrolStartX: number;
  @type("number") patrolDirection: number = 1;
}

export enum LootType {
  COIN = "coin",
  // Add more types as needed:
  // GEM = 'gem',
  // POTION = 'potion',
  // etc.
}

export class Loot extends Schema {
  @type("string") type: LootType;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;
  @type("number") value: number = 1;
  @type("number") spawnTime: number = Date.now();
  @type("string") collectedBy: string = null; // Player sessionId who's collecting it
  @type("boolean") isBeingCollected: boolean = false;
}

export class MyRoomState extends Schema {
  @type("number") mapWidth: number;
  @type("number") mapHeight: number;

  @type({ map: Player }) players = new MapSchema<Player>();
  @type([Obstacle]) obstacles = new Array<Obstacle>();
  @type([Monster]) monsters = new Array<Monster>();
  @type([Loot]) loot = new Array<Loot>();
}

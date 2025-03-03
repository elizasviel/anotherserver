import { Schema, type, MapSchema } from "@colyseus/schema";
import {
  MonsterInterface,
  SpawnedMonsterInterface,
  LootInterface,
  SpawnedLootInterface,
  PlayerInterface,
  SpawnedPlayerInterface,
  InputData,
  ObstacleInterface,
} from "../gameObjects";

export class Obstacle extends Schema implements ObstacleInterface {
  @type("string") id: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") width: number;
  @type("number") height: number;
  @type("boolean") isOneWayPlatform: boolean;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    isOneWayPlatform: boolean
  ) {
    super();
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isOneWayPlatform = isOneWayPlatform;
  }
}

export class Loot extends Schema implements LootInterface {
  @type("string") name: string = "";
  @type("number") width: number = 32;
  @type("number") height: number = 32;
}

export class SpawnedLoot extends Schema implements SpawnedLootInterface {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;
  @type("number") width: number = 32;
  @type("number") height: number = 32;
  @type("number") spawnTime: number = Date.now();
  @type("string") collectedBy: string = null;
  @type("boolean") isBeingCollected: boolean = false;

  constructor(
    id: string,
    name: string,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    width: number,
    height: number,
    spawnTime: number
  ) {
    super();
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.width = width;
    this.height = height;
    this.spawnTime = spawnTime;
    this.collectedBy = null;
    this.isBeingCollected = false;
  }
}

export class SpawnedPlayer extends Schema implements SpawnedPlayerInterface {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number;
  @type("number") velocityY: number;
  @type("number") experience: number = 0;
  @type("number") level: number = 1;
  @type("number") height: number = 32;
  @type("number") width: number = 32;
  @type("number") tick: number;
  @type("boolean") isAttacking: boolean;
  @type("boolean") isGrounded: boolean;
  inputQueue: InputData[];

  constructor(
    id: string,
    username: string,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    experience: number,
    level: number,
    height: number,
    width: number,
    tick: number,
    isAttacking: boolean,
    isGrounded: boolean,
    inputQueue: InputData[]
  ) {
    super();
    this.id = id;
    this.username = username;
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.experience = experience;
    this.level = level;
    this.height = height;
    this.width = width;
    this.tick = tick;
    this.isAttacking = isAttacking;
    this.isGrounded = isGrounded;
    this.inputQueue = inputQueue;
  }
}

export class SpawnedMonster extends Schema implements SpawnedMonsterInterface {
  @type("string") name: string = "";
  @type("number") maxHealth: number;
  @type("number") damage: number;
  @type("number") speed: number;
  @type("number") height: number;
  @type("number") width: number;
  @type("number") detectionRange: number;
  @type("number") experience: number;
  @type("number") potentialLoot: LootInterface[];
  @type("string") id: string = "";
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number;
  @type("number") velocityY: number;
  @type("number") currentHealth: number;
  @type("boolean") isGrounded: boolean;
  @type("boolean") isHit: boolean;

  constructor(
    id: string,
    monsterType: MonsterInterface,
    spawnX: number,
    spawnY: number
  ) {
    super();
    this.id = id;
    this.name = monsterType.name;
    this.x = spawnX;
    this.y = spawnY;

    // Copy properties from monsterType
    this.maxHealth = monsterType.maxHealth;
    this.currentHealth = monsterType.maxHealth;
    this.damage = monsterType.damage;
    this.speed = monsterType.speed;
    this.height = monsterType.height;
    this.width = monsterType.width;
    this.detectionRange = monsterType.detectionRange;
    this.experience = monsterType.experience;
  }
}

export class Portal extends Schema {
  @type("string") id: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") width: number = 64;
  @type("number") height: number = 64;
  @type("string") targetRoom: string;
  @type("number") targetX: number;
  @type("number") targetY: number;
  @type("boolean") isOneWayPlatform: boolean = false;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    targetRoom: string,
    targetX: number,
    targetY: number
  ) {
    super();
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.targetRoom = targetRoom;
    this.targetX = targetX;
    this.targetY = targetY;
  }
}

export class MyRoomState extends Schema {
  @type("number") mapWidth: number;
  @type("number") mapHeight: number;

  @type([SpawnedPlayer]) spawnedPlayers = new Array<SpawnedPlayer>();
  @type([Obstacle]) obstacles = new Array<Obstacle>();
  @type([SpawnedMonster]) spawnedMonsters = new Array<SpawnedMonster>();
  @type([SpawnedLoot]) loot = new Array<SpawnedLoot>();
  @type([Portal]) portals = new Array<Portal>();
}

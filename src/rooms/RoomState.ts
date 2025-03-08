import { Schema, type } from "@colyseus/schema";
import {
  MonsterInterface,
  SpawnedMonsterInterface,
  LootInterface,
  SpawnedLootInterface,
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

  constructor(name: string, width: number, height: number) {
    super();
    this.name = name;
    this.width = width;
    this.height = height;
  }
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
  @type("boolean") canAttack: boolean = true;
  @type("boolean") canLoot: boolean = true;
  @type("boolean") canJump: boolean = true;
  @type("boolean") isAttacking: boolean = false;
  @type("number") lastProcessedTick: number = 0;
  @type("number") lastDamageTime: number = 0;
  @type("number") maxHealth: number = 100;
  @type("number") currentHealth: number = 100;
  @type("boolean") isInvulnerable: boolean = false;
  @type("number") strength: number = 10;
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
    canAttack: boolean,
    canLoot: boolean,
    canJump: boolean,
    isAttacking: boolean,
    inputQueue: InputData[],
    maxHealth: number = 100
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
    this.canAttack = canAttack;
    this.canLoot = canLoot;
    this.canJump = canJump;
    this.isAttacking = isAttacking;
    this.inputQueue = inputQueue;
    this.lastProcessedTick = 0;
    this.lastDamageTime = 0;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.isInvulnerable = false;
    this.strength = 10;
  }
}

export class SpawnedMonster extends Schema implements SpawnedMonsterInterface {
  @type("string") name: string = "";
  @type("number") maxHealth: number;
  @type("number") damage: number;
  @type("number") height: number;
  @type("number") width: number;
  @type("number") detectionRange: number;
  @type("number") experience: number;
  @type([Loot]) potentialLoot: Loot[] = [];
  @type("string") id: string = "";
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number;
  @type("number") velocityY: number;
  @type("number") currentHealth: number;
  @type("boolean") canJump: boolean;
  @type("string") behaviorState: string;
  @type("number") behaviorTimer: number;
  @type("number") behaviorDuration: number;

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
    this.velocityX = 1;
    this.velocityY = 0;
    this.maxHealth = monsterType.maxHealth;
    this.currentHealth = monsterType.maxHealth;
    this.damage = monsterType.damage;
    this.height = monsterType.height;
    this.width = monsterType.width;
    this.detectionRange = monsterType.detectionRange;
    this.experience = monsterType.experience;
    this.potentialLoot = monsterType.potentialLoot.map(
      (loot) => new Loot(loot.name, loot.width, loot.height)
    );
    this.canJump = true;
    this.behaviorState = "idle";
    this.behaviorTimer = 0;
    this.behaviorDuration = Math.random() * 3000 + 1000;
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
  @type([SpawnedLoot]) spawnedLoot = new Array<SpawnedLoot>();
  @type([Portal]) portals = new Array<Portal>();
}

//Room data is a superset of persisted data
//Experience is persisted because we need it to be constant across rooms

//Room data (in RoomState.ts) contains everything needed for the current game state, including transient data like player positions, velocities, input queues, etc.
//Persisted data (in playerData.ts) contains only the essential data that needs to persist between sessions and across different rooms.

//Experience is indeed a good example of data that needs to be persisted because:
//It's accumulated across different rooms
//It shouldn't reset when changing rooms or logging out
//It's part of the player's progression

import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";
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
  @type("string") name: string;
  @type("number") width: number;
  @type("number") height: number;

  constructor(name: string, width: number, height: number) {
    super();
    this.name = name;
    this.width = width;
    this.height = height;
  }
}

export class SpawnedLoot extends Schema implements SpawnedLootInterface {
  @type("string") id: string;
  @type("string") name: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number;
  @type("number") velocityY: number;
  @type("number") width: number;
  @type("number") height: number;
  @type("number") spawnTime: number;
  @type("string") collectedBy: string;
  @type("boolean") isBeingCollected: boolean;

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
  @type("string") id: string;
  @type("string") username: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number;
  @type("number") velocityY: number;
  @type("number") experience: number;
  @type("number") level: number;
  @type("number") height: number;
  @type("number") width: number;
  @type("boolean") canAttack: boolean;
  @type("boolean") canLoot: boolean;
  @type("boolean") canJump: boolean;
  @type("boolean") isAttacking: boolean;
  @type("number") lastProcessedTick: number;
  @type("number") lastDamageTime: number;
  @type("number") maxHealth: number;
  @type("number") currentHealth: number;
  @type("boolean") isInvulnerable: boolean;
  @type("number") strength: number;
  @type({ map: Loot }) inventory = new MapSchema<Loot>();
  @type({ map: "number" }) inventoryQuantities = new MapSchema<number>();
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
    lastProcessedTick: number,
    lastDamageTime: number,
    maxHealth: number,
    currentHealth: number,
    isInvulnerable: boolean,
    strength: number,
    inventory: { loot: Loot; quantity: number }[],
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
    this.canAttack = canAttack;
    this.canLoot = canLoot;
    this.canJump = canJump;
    this.isAttacking = isAttacking;
    this.inputQueue = inputQueue;
    this.lastProcessedTick = lastProcessedTick;
    this.lastDamageTime = lastDamageTime;
    this.maxHealth = maxHealth;
    this.currentHealth = currentHealth;
    this.isInvulnerable = isInvulnerable;
    this.strength = strength;

    // Convert inventory items to MapSchema
    if (inventory) {
      inventory.forEach((item) => {
        const lootId = item.loot.name; // Use name as the key
        this.inventory.set(lootId, item.loot);
        this.inventoryQuantities.set(lootId, item.quantity);
      });
    }
  }
}

export class SpawnedMonster extends Schema implements SpawnedMonsterInterface {
  @type("string") id: string;
  @type("string") name: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") velocityX: number;
  @type("number") velocityY: number;
  @type("number") maxHealth: number;
  @type("number") currentHealth: number;
  @type("number") damage: number;
  @type("number") height: number;
  @type("number") width: number;
  @type("number") detectionRange: number;
  @type("number") experience: number;
  @type("boolean") canJump: boolean;
  @type("string") behaviorState: string;
  @type("number") behaviorTimer: number;
  @type("number") behaviorDuration: number;
  @type([Loot]) potentialLoot: Loot[];

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
    this.velocityX = 0;
    this.velocityY = 0;
    this.maxHealth = monsterType.maxHealth;
    this.currentHealth = monsterType.maxHealth;
    this.damage = monsterType.damage;
    this.height = monsterType.height;
    this.width = monsterType.width;
    this.detectionRange = monsterType.detectionRange;
    this.experience = monsterType.experience;
    this.canJump = true;
    this.behaviorState = "idle";
    this.behaviorTimer = 0;
    this.behaviorDuration = Math.random() * 3000 + 1000;
    this.potentialLoot = monsterType.potentialLoot.map(
      (loot) => new Loot(loot.name, loot.width, loot.height)
    );
  }
}

export class Portal extends Schema {
  @type("string") id: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") width: number;
  @type("number") height: number;
  @type("string") targetRoom: string;
  @type("number") targetX: number;
  @type("number") targetY: number;
  @type("boolean") isOneWayPlatform: boolean;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    targetRoom: string,
    targetX: number,
    targetY: number,
    isOneWayPlatform: boolean
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
    this.isOneWayPlatform = isOneWayPlatform;
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

//spawnloot concern

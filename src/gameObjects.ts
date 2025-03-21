export interface InputData {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
  loot: boolean;
  tick: number;
  username: string;
}

export interface ObstacleInterface {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOneWayPlatform: boolean;
}

export interface MonsterInterface {
  name: string;
  maxHealth: number;
  damage: number;
  height: number;
  width: number;
  detectionRange: number;
  experience: number;
  potentialLoot: LootInterface[];
}

export interface SpawnedMonsterInterface extends MonsterInterface {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  currentHealth: number;
  canJump: boolean;
}

export interface LootInterface {
  name: string;
  width: number;
  height: number;
}

export interface SpawnedLootInterface extends LootInterface {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  spawnTime: number;
  collectedBy: string;
  isBeingCollected: boolean;
}

export interface PlayerInterface {
  id: string;
  username: string;
  experience: number;
  level: number;
  maxHealth: number;
  currentHealth: number;
  strength: number;
  inventory: any;
}

export interface SpawnedPlayerInterface extends PlayerInterface {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  height: number;
  width: number;
  canAttack: boolean;
  canLoot: boolean;
  canJump: boolean;
  isAttacking: boolean;
  lastProcessedTick: number;
  lastDamageTime: number;
  inputQueue: InputData[];
  isInvulnerable: boolean;
}

export const LOOT_TYPES: Record<string, LootInterface> = {
  smallCoin: { name: "Small Coin", width: 16, height: 16 },
  mediumCoin: { name: "Medium Coin", width: 24, height: 24 },
  largeCoin: { name: "Large Coin", width: 32, height: 32 },
};

export const MONSTER_TYPES: Record<string, MonsterInterface> = {
  snail: {
    name: "Snail",
    maxHealth: 100,
    damage: 5,
    height: 24,
    width: 24,
    detectionRange: 100,
    experience: 10,
    potentialLoot: [LOOT_TYPES.smallCoin],
  },
  bee: {
    name: "Bee",
    maxHealth: 150,
    damage: 10,
    height: 32,
    width: 32,
    detectionRange: 150,
    experience: 20,
    potentialLoot: [LOOT_TYPES.smallCoin, LOOT_TYPES.mediumCoin],
  },
  boar: {
    name: "Boar",
    maxHealth: 200,
    damage: 20,
    height: 50,
    width: 50,
    detectionRange: 250,
    experience: 40,
    potentialLoot: [
      LOOT_TYPES.smallCoin,
      LOOT_TYPES.mediumCoin,
      LOOT_TYPES.largeCoin,
    ],
  },
  blackBoar: {
    name: "Black Boar",
    maxHealth: 1000,
    damage: 100,
    height: 100,
    width: 100,
    detectionRange: 300,
    experience: 500,
    potentialLoot: [
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.largeCoin,
    ],
  },
  whiteBoar: {
    name: "White Boar",
    maxHealth: 500,
    damage: 50,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [LOOT_TYPES.largeCoin],
  },
  blackWolf: {
    name: "Black Wolf",
    maxHealth: 500,
    damage: 100,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [LOOT_TYPES.largeCoin, LOOT_TYPES.mediumCoin],
  },
  whiteWolf: {
    name: "White Wolf",
    maxHealth: 500,
    damage: 100,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [LOOT_TYPES.largeCoin, LOOT_TYPES.mediumCoin],
  },
  grayWolf: {
    name: "Gray Wolf",
    maxHealth: 500,
    damage: 100,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [LOOT_TYPES.largeCoin, LOOT_TYPES.mediumCoin],
  },
  brownWolf: {
    name: "Brown Wolf",
    maxHealth: 500,
    damage: 100,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [LOOT_TYPES.largeCoin, LOOT_TYPES.mediumCoin],
  },
};

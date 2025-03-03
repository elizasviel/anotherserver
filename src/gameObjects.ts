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
  speed: number;
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
  isGrounded: boolean;
  isHit: boolean;
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
}

export interface SpawnedPlayerInterface extends PlayerInterface {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  height: number;
  width: number;
  tick: number;
  isAttacking: boolean;
  isGrounded: boolean;
  inputQueue: InputData[];
}

export const LOOT_TYPES: Record<string, LootInterface> = {
  smallCoin: { name: "Small Coin", width: 16, height: 16 },
  mediumCoin: { name: "Medium Coin", width: 24, height: 24 },
  largeCoin: { name: "Large Coin", width: 32, height: 32 },
};

export const MONSTER_TYPES: Record<string, MonsterInterface> = {
  slime: {
    name: "Slime",
    maxHealth: 50,
    damage: 5,
    speed: 0.5,
    height: 24,
    width: 24,
    detectionRange: 100,
    experience: 10,
    potentialLoot: [LOOT_TYPES.smallCoin],
  },
  goblin: {
    name: "Goblin",
    maxHealth: 80,
    damage: 10,
    speed: 1.2,
    height: 32,
    width: 32,
    detectionRange: 150,
    experience: 20,
    potentialLoot: [LOOT_TYPES.smallCoin],
  },
  skeleton: {
    name: "Skeleton",
    maxHealth: 120,
    damage: 15,
    speed: 0.8,
    height: 40,
    width: 40,
    detectionRange: 200,
    experience: 30,
    potentialLoot: [LOOT_TYPES.smallCoin],
  },
  boar: {
    name: "Boar",
    maxHealth: 150,
    damage: 20,
    speed: 1.5,
    height: 50,
    width: 50,
    detectionRange: 250,
    experience: 40,
    potentialLoot: [LOOT_TYPES.smallCoin],
  },
};

import { textChangeRangeIsUnchanged } from "typescript";

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
  mediumCoin: { name: "Medium Coin", width: 16, height: 16 },
  largeCoin: { name: "Large Coin", width: 16, height: 16 },
  sword: { name: "Sword", width: 16, height: 16 },
  whiteFeather: { name: "White Feather", width: 16, height: 16 },
  whiteQuill: { name: "White Quill", width: 16, height: 16 },
  greyFeather: { name: "Grey Feather", width: 16, height: 16 },
  greyQuill: { name: "Grey Quill", width: 16, height: 16 },
  blackFeather: { name: "Black Feather", width: 16, height: 16 },
  blackQuill: { name: "Black Quill", width: 16, height: 16 },
  brownFeather: { name: "Brown Feather", width: 16, height: 16 },
  brownQuill: { name: "Brown Quill", width: 16, height: 16 },
  redFeather: { name: "Red Feather", width: 16, height: 16 },
  redQuill: { name: "Red Quill", width: 16, height: 16 },
  violetFeather: { name: "Violet Feather", width: 16, height: 16 },
  violetQuill: { name: "Violet Quill", width: 16, height: 16 },
  purpleFeather: { name: "Purple Feather", width: 16, height: 16 },
  purpleQuill: { name: "Purple Quill", width: 16, height: 16 },
  blueFeather: { name: "Blue Feather", width: 16, height: 16 },
  blueQuill: { name: "Blue Quill", width: 16, height: 16 },
  tealFeather: { name: "Teal Feather", width: 16, height: 16 },
  tealQuill: { name: "Teal Quill", width: 16, height: 16 },
  greenFeather: { name: "Green Feather", width: 16, height: 16 },
  greenQuill: { name: "Green Quill", width: 16, height: 16 },
  yellowFeather: { name: "Yellow Feather", width: 16, height: 16 },
  yellowQuill: { name: "Yellow Quill", width: 16, height: 16 },
  cherry: { name: "Cherry", width: 16, height: 16 },
  blackCurrant: { name: "Black Currant", width: 16, height: 16 },
  redCurrant: { name: "Red Currant", width: 16, height: 16 },
  cucumber: { name: "Cucumber", width: 16, height: 16 },
  sugarApple: { name: "Sugar Apple", width: 16, height: 16 },
  date: { name: "Date", width: 16, height: 16 },
  dragonFruit: { name: "Dragon Fruit", width: 16, height: 16 },
  breadFruit: { name: "Bread Fruit", width: 16, height: 16 },
  fig: { name: "Fig", width: 16, height: 16 },
  rubyGrape: { name: "Ruby Grape", width: 16, height: 16 },
  muscatGrape: { name: "Muscat Grape", width: 16, height: 16 },
  grapeFruit: { name: "Grape Fruit", width: 16, height: 16 },
  honeyDew: { name: "Honey Dew", width: 16, height: 16 },
  kiwi: { name: "Kiwi", width: 16, height: 16 },
  yellowMelon: { name: "Yellow Melon", width: 16, height: 16 },
  redApple: { name: "Red Apple", width: 16, height: 16 },
  tangerine: { name: "Tangerine", width: 16, height: 16 },
  greenPear: { name: "Green Pear", width: 16, height: 16 },
  nectarine: { name: "Nectarine", width: 16, height: 16 },
  passionFruit: { name: "Passion Fruit", width: 16, height: 16 },
  apricot: { name: "Apricot", width: 16, height: 16 },
  strawberry: { name: "Strawberry", width: 16, height: 16 },
  watermelon: { name: "Watermelon", width: 16, height: 16 },
  cantaloupe: { name: "Cantaloupe", width: 16, height: 16 },
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
    potentialLoot: [
      LOOT_TYPES.smallCoin,
      LOOT_TYPES.mediumCoin,
      LOOT_TYPES.honeyDew,
      LOOT_TYPES.whiteFeather,
      LOOT_TYPES.whiteQuill,
    ],
  },
  bee: {
    name: "Bee",
    maxHealth: 150,
    damage: 10,
    height: 32,
    width: 32,
    detectionRange: 150,
    experience: 20,
    potentialLoot: [
      LOOT_TYPES.fig,
      LOOT_TYPES.rubyGrape,
      LOOT_TYPES.muscatGrape,
      LOOT_TYPES.grapeFruit,
      LOOT_TYPES.honeyDew,
    ],
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
      LOOT_TYPES.sword,
      LOOT_TYPES.whiteFeather,
      LOOT_TYPES.whiteQuill,
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
      LOOT_TYPES.watermelon,
      LOOT_TYPES.cantaloupe,
      LOOT_TYPES.apricot,
      LOOT_TYPES.strawberry,
      LOOT_TYPES.nectarine,
      LOOT_TYPES.passionFruit,
      LOOT_TYPES.dragonFruit,
      LOOT_TYPES.breadFruit,
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
    potentialLoot: [
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.mediumCoin,
      LOOT_TYPES.sword,
      LOOT_TYPES.whiteFeather,
      LOOT_TYPES.whiteQuill,
    ],
  },
  blackWolf: {
    name: "Black Wolf",
    maxHealth: 500,
    damage: 100,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.mediumCoin,
      LOOT_TYPES.sword,
      LOOT_TYPES.whiteFeather,
      LOOT_TYPES.whiteQuill,
    ],
  },
  whiteWolf: {
    name: "White Wolf",
    maxHealth: 500,
    damage: 100,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.mediumCoin,
      LOOT_TYPES.sword,
      LOOT_TYPES.whiteFeather,
      LOOT_TYPES.whiteQuill,
      LOOT_TYPES.greyFeather,
      LOOT_TYPES.greyQuill,
      LOOT_TYPES.blackFeather,
      LOOT_TYPES.blackQuill,
      LOOT_TYPES.brownFeather,
      LOOT_TYPES.brownQuill,
    ],
  },
  grayWolf: {
    name: "Gray Wolf",
    maxHealth: 500,
    damage: 100,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.mediumCoin,
      LOOT_TYPES.sword,
      LOOT_TYPES.cherry,
      LOOT_TYPES.blackCurrant,
      LOOT_TYPES.redCurrant,
      LOOT_TYPES.cucumber,
      LOOT_TYPES.sugarApple,
      LOOT_TYPES.date,
    ],
  },
  brownWolf: {
    name: "Brown Wolf",
    maxHealth: 500,
    damage: 100,
    height: 50,
    width: 50,
    detectionRange: 300,
    experience: 100,
    potentialLoot: [
      LOOT_TYPES.largeCoin,
      LOOT_TYPES.mediumCoin,
      LOOT_TYPES.sword,
      LOOT_TYPES.cherry,
      LOOT_TYPES.blackCurrant,
      LOOT_TYPES.redCurrant,
      LOOT_TYPES.cucumber,
      LOOT_TYPES.sugarApple,
      LOOT_TYPES.date,
    ],
  },
};

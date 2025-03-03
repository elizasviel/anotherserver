"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONSTER_TYPES = exports.LOOT_TYPES = void 0;
exports.LOOT_TYPES = {
    smallCoin: { name: "Small Coin", width: 16, height: 16 },
    mediumCoin: { name: "Medium Coin", width: 24, height: 24 },
    largeCoin: { name: "Large Coin", width: 32, height: 32 },
};
exports.MONSTER_TYPES = {
    slime: {
        name: "Slime",
        maxHealth: 50,
        damage: 5,
        speed: 0.5,
        height: 24,
        width: 24,
        detectionRange: 100,
        experience: 10,
        potentialLoot: [exports.LOOT_TYPES.smallCoin],
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
        potentialLoot: [exports.LOOT_TYPES.smallCoin],
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
        potentialLoot: [exports.LOOT_TYPES.smallCoin],
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
        potentialLoot: [exports.LOOT_TYPES.smallCoin],
    },
};

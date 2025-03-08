"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONSTER_TYPES = exports.LOOT_TYPES = void 0;
exports.LOOT_TYPES = {
    smallCoin: { name: "Small Coin", width: 16, height: 16 },
    mediumCoin: { name: "Medium Coin", width: 24, height: 24 },
    largeCoin: { name: "Large Coin", width: 32, height: 32 },
};
exports.MONSTER_TYPES = {
    snail: {
        name: "Snail",
        maxHealth: 50,
        damage: 5,
        height: 24,
        width: 24,
        detectionRange: 100,
        experience: 10,
        potentialLoot: [exports.LOOT_TYPES.smallCoin],
    },
    bee: {
        name: "Bee",
        maxHealth: 10,
        damage: 20,
        height: 32,
        width: 32,
        detectionRange: 150,
        experience: 20,
        potentialLoot: [exports.LOOT_TYPES.smallCoin, exports.LOOT_TYPES.mediumCoin],
    },
    boar: {
        name: "Boar",
        maxHealth: 150,
        damage: 20,
        height: 50,
        width: 50,
        detectionRange: 250,
        experience: 40,
        potentialLoot: [
            exports.LOOT_TYPES.smallCoin,
            exports.LOOT_TYPES.mediumCoin,
            exports.LOOT_TYPES.largeCoin,
        ],
    },
    blackBoar: {
        name: "Black Boar",
        maxHealth: 500,
        damage: 25,
        height: 100,
        width: 100,
        detectionRange: 300,
        experience: 100,
        potentialLoot: [
            exports.LOOT_TYPES.largeCoin,
            exports.LOOT_TYPES.largeCoin,
            exports.LOOT_TYPES.largeCoin,
            exports.LOOT_TYPES.largeCoin,
            exports.LOOT_TYPES.largeCoin,
        ],
    },
    whiteBoar: {
        name: "White Boar",
        maxHealth: 250,
        damage: 25,
        height: 50,
        width: 50,
        detectionRange: 300,
        experience: 100,
        potentialLoot: [exports.LOOT_TYPES.largeCoin],
    },
};

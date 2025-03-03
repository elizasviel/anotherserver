"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerRegistry = void 0;
const tools_1 = __importDefault(require("@colyseus/tools"));
const core_1 = require("@colyseus/core");
const gameObjects_1 = require("./gameObjects");
const Map_1 = require("./rooms/Map");
let gameServerRef;
exports.playerRegistry = new Map();
const { slime, goblin, skeleton, boar } = gameObjects_1.MONSTER_TYPES;
exports.default = (0, tools_1.default)({
    options: {
        devMode: false,
    },
    initializeGameServer: (gameServer) => {
        gameServer.define("village", Map_1.map);
        (async () => {
            await core_1.matchMaker.createRoom("village", {
                path: "./src/Maps/VillageMap.tmj",
                monsters: [
                    {
                        monsterType: slime,
                        spawnInterval: 1000,
                        maxSpawned: 10,
                        minSpawned: 5,
                    },
                    {
                        monsterType: goblin,
                        spawnInterval: 1000,
                        maxSpawned: 10,
                        minSpawned: 5,
                    },
                    {
                        monsterType: skeleton,
                        spawnInterval: 1000,
                        maxSpawned: 10,
                        minSpawned: 5,
                    },
                    {
                        monsterType: boar,
                        spawnInterval: 1000,
                        maxSpawned: 10,
                        minSpawned: 5,
                    },
                ],
            });
        })();
        gameServerRef = gameServer;
    },
});

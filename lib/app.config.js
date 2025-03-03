"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("@colyseus/tools"));
const core_1 = require("@colyseus/core");
const gameObjects_1 = require("./gameObjects");
const Map_1 = require("./rooms/Map");
let gameServerRef;
const { slime, goblin, skeleton, boar } = gameObjects_1.MONSTER_TYPES;
exports.default = (0, tools_1.default)({
    options: {
        devMode: false,
    },
    initializeGameServer: (gameServer) => {
        // Define different map rooms
        gameServer.define("village", Map_1.map);
        gameServer.define("forest", Map_1.map);
        gameServer.define("dungeon", Map_1.map);
        // Create the village map with a portal to the forest
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
                portals: [
                    {
                        id: "forest-portal",
                        x: 500,
                        y: 300,
                        width: 64,
                        height: 64,
                        targetRoom: "forest",
                        targetX: 100,
                        targetY: 100,
                    },
                ],
            });
            // Create the forest map with portals to village and dungeon
            await core_1.matchMaker.createRoom("forest", {
                path: "./src/Maps/VillageMap.tmj",
                monsters: [
                    {
                        monsterType: goblin,
                        spawnInterval: 1500,
                        maxSpawned: 8,
                        minSpawned: 3,
                    },
                    {
                        monsterType: slime,
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
                portals: [
                    {
                        id: "village-portal",
                        x: 100,
                        y: 100,
                        width: 64,
                        height: 64,
                        targetRoom: "village",
                        targetX: 500,
                        targetY: 300,
                    },
                    {
                        id: "dungeon-portal",
                        x: 800,
                        y: 400,
                        width: 64,
                        height: 64,
                        targetRoom: "dungeon",
                        targetX: 150,
                        targetY: 150,
                    },
                ],
            });
            // Create the dungeon map with a portal back to the forest
            await core_1.matchMaker.createRoom("dungeon", {
                path: "./src/Maps/VillageMap.tmj",
                monsters: [
                    {
                        monsterType: skeleton,
                        spawnInterval: 2000,
                        maxSpawned: 6,
                        minSpawned: 2,
                    },
                    {
                        monsterType: goblin,
                        spawnInterval: 1000,
                        maxSpawned: 10,
                        minSpawned: 5,
                    },
                    {
                        monsterType: slime,
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
                portals: [
                    {
                        id: "forest-portal",
                        x: 150,
                        y: 150,
                        width: 64,
                        height: 64,
                        targetRoom: "forest",
                        targetX: 800,
                        targetY: 400,
                    },
                ],
            });
        })();
        gameServerRef = gameServer;
    },
});

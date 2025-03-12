"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("@colyseus/tools"));
const core_1 = require("@colyseus/core");
const Map_1 = require("./rooms/Map");
const gameObjects_1 = require("./gameObjects");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const cors_1 = __importDefault(require("cors"));
let gameServerRef;
const { snail, bee, boar, whiteBoar, blackBoar } = gameObjects_1.MONSTER_TYPES;
exports.default = (0, tools_1.default)({
    options: {
        devMode: false,
    },
    initializeGameServer: (gameServer) => {
        // Define different map rooms
        gameServer.define("village", Map_1.map);
        gameServer.define("field", Map_1.map);
        gameServer.define("field1", Map_1.map);
        (async () => {
            await core_1.matchMaker.createRoom("village", {
                path: "./src/maps/VillageMap.tmj",
                monsters: [
                    {
                        monsterType: snail,
                        spawnInterval: 5000,
                        maxSpawned: 5,
                    },
                ],
                portals: [
                    {
                        id: "field-portal",
                        x: 50,
                        y: 650,
                        width: 64,
                        height: 64,
                        targetRoom: "field",
                        targetX: 1550,
                        targetY: 420,
                    },
                    {
                        id: "field1-portal",
                        x: 1550,
                        y: 620,
                        width: 64,
                        height: 64,
                        targetRoom: "field1",
                        targetX: 50,
                        targetY: 320,
                    },
                ],
            });
            await core_1.matchMaker.createRoom("field", {
                path: "./src/maps/FieldMap.tmj",
                monsters: [
                    {
                        monsterType: boar,
                        spawnInterval: 5000,
                        maxSpawned: 5,
                    },
                    {
                        monsterType: whiteBoar,
                        spawnInterval: 5000,
                        maxSpawned: 3,
                    },
                ],
                portals: [
                    {
                        id: "village-portal",
                        x: 1550,
                        y: 420,
                        width: 64,
                        height: 64,
                        targetRoom: "village",
                        targetX: 80,
                        targetY: 650,
                    },
                    {
                        id: "field1-portal",
                        x: 50,
                        y: 480,
                        width: 64,
                        height: 64,
                        targetRoom: "field1",
                        targetX: 1550,
                        targetY: 420,
                    },
                ],
            });
            await core_1.matchMaker.createRoom("field1", {
                path: "./src/maps/FieldMap1.tmj",
                monsters: [
                    {
                        monsterType: boar,
                        spawnInterval: 5000,
                        maxSpawned: 5,
                    },
                    {
                        monsterType: bee,
                        spawnInterval: 5000,
                        maxSpawned: 3,
                    },
                    {
                        monsterType: blackBoar,
                        spawnInterval: 5000,
                        maxSpawned: 1,
                    },
                ],
                portals: [
                    {
                        id: "field-portal1",
                        x: 1550,
                        y: 450,
                        width: 64,
                        height: 64,
                        targetRoom: "field",
                        targetX: 50,
                        targetY: 460,
                    },
                    {
                        id: "village-portal1",
                        x: 50,
                        y: 320,
                        width: 64,
                        height: 64,
                        targetRoom: "village",
                        targetX: 1550,
                        targetY: 620,
                    },
                ],
            });
        })();
        gameServerRef = gameServer;
    },
    initializeExpress: (app) => {
        // Enable CORS
        app.use((0, cors_1.default)({
            origin: [
                "http://localhost:2567",
                "http://localhost:1234",
                "http://localhost:3000",
                "https://platformerclient-5a4e26f76ab1.herokuapp.com/",
            ],
            credentials: true,
        }));
        // Parse JSON bodies
        app.use(express_1.default.json());
        // Serve auth endpoints
        app.use("/auth", auth_1.default);
        // Serve static files from the client directory
        app.use(express_1.default.static("client/dist"));
    },
});
//Defines 3 kinds of rooms and creates one of each kind

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("@colyseus/tools"));
const core_1 = require("@colyseus/core");
const Map_1 = require("./rooms/Map");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const cors_1 = __importDefault(require("cors"));
let gameServerRef;
exports.default = (0, tools_1.default)({
    options: {
        devMode: false,
    },
    initializeGameServer: (gameServer) => {
        // Define different map rooms
        gameServer.define("village", Map_1.map);
        gameServer.define("forest", Map_1.map);
        gameServer.define("dungeon", Map_1.map);
        (async () => {
            await core_1.matchMaker.createRoom("village", {
                path: "./src/Maps/VillageMap.tmj",
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
            await core_1.matchMaker.createRoom("forest", {
                path: "./src/Maps/VillageMap.tmj",
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
            await core_1.matchMaker.createRoom("dungeon", {
                path: "./src/Maps/VillageMap.tmj",
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
    initializeExpress: (app) => {
        // Enable CORS
        app.use((0, cors_1.default)({
            origin: "http://localhost:1234",
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
//This file

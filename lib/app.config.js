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
        gameServer.define("field", Map_1.map);
        (async () => {
            await core_1.matchMaker.createRoom("village", {
                path: "./src/Maps/VillageMap.tmj",
                portals: [
                    {
                        id: "field-portal",
                        x: 500,
                        y: 700,
                        width: 64,
                        height: 64,
                        targetRoom: "field",
                        targetX: 150,
                        targetY: 500,
                    },
                ],
            });
            await core_1.matchMaker.createRoom("field", {
                path: "./src/Maps/FieldMap.tmj",
                portals: [
                    {
                        id: "village-portal",
                        x: 500,
                        y: 700,
                        width: 64,
                        height: 64,
                        targetRoom: "village",
                        targetX: 800,
                        targetY: 500,
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
//Defines 3 kinds of rooms and creates one of each kind

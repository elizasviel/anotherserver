"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerRegistry = void 0;
const tools_1 = __importDefault(require("@colyseus/tools"));
const core_1 = require("@colyseus/core");
const Village_1 = require("./rooms/Village");
let gameServerRef;
exports.playerRegistry = new Map();
exports.default = (0, tools_1.default)({
    options: {
        devMode: false,
    },
    initializeGameServer: (gameServer) => {
        gameServer.define("village", Village_1.Village);
        (async () => {
            await core_1.matchMaker.createRoom("village", {});
        })();
        gameServerRef = gameServer;
    },
});

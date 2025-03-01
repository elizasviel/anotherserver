"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("@colyseus/tools"));
const monitor_1 = require("@colyseus/monitor");
const Part4Room_1 = require("./rooms/Part4Room");
let gameServerRef;
let latencySimulationMs = 0;
exports.default = (0, tools_1.default)({
    options: {
        devMode: false,
    },
    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define("part4_room", Part4Room_1.Part4Room);
        //
        // keep gameServer reference, so we can
        // call `.simulateLatency()` later through an http route
        //
        gameServerRef = gameServer;
    },
    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
        // these latency methods are for development purpose only.
        app.get("/latency", (req, res) => res.json(latencySimulationMs));
        app.get("/simulate-latency/:milliseconds", (req, res) => {
            latencySimulationMs = parseInt(req.params.milliseconds || "100");
            // enable latency simulation
            gameServerRef.simulateLatency(latencySimulationMs);
            res.json({ success: true });
        });
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", (0, monitor_1.monitor)());
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    },
});

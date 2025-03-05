import config from "@colyseus/tools";
import { Server } from "colyseus";
import { matchMaker } from "@colyseus/core";
import { map } from "./rooms/Map";
import { MONSTER_TYPES } from "./gameObjects";
import express from "express";
import authRouter from "./auth";
import cors from "cors";

let gameServerRef: Server;

const { slime, goblin, skeleton, boar } = MONSTER_TYPES;

export default config({
  options: {
    devMode: false,
  },

  initializeGameServer: (gameServer) => {
    // Define different map rooms
    gameServer.define("village", map);
    gameServer.define("field", map);

    (async () => {
      await matchMaker.createRoom("village", {
        path: "./src/Maps/VillageMap.tmj",
        monsters: [
          {
            monsterType: boar,
            spawnInterval: 2000,
            maxSpawned: 10,
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
        ],
      });

      await matchMaker.createRoom("field", {
        path: "./src/Maps/FieldMap.tmj",
        monsters: [
          {
            monsterType: boar,
            spawnInterval: 2000,
            maxSpawned: 10,
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
            targetX: 50,
            targetY: 650,
          },
        ],
      });
    })();

    gameServerRef = gameServer;
  },

  initializeExpress: (app) => {
    // Enable CORS
    app.use(
      cors({
        origin: "http://localhost:1234", // Your client's URL
        credentials: true,
      })
    );

    // Parse JSON bodies
    app.use(express.json());

    // Serve auth endpoints
    app.use("/auth", authRouter);

    // Serve static files from the client directory
    app.use(express.static("client/dist"));
  },
});

//Defines 3 kinds of rooms and creates one of each kind

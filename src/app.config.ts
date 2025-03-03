import config from "@colyseus/tools";
import { Server } from "colyseus";
import { matchMaker } from "@colyseus/core";
import { map } from "./rooms/Map";
import express from "express";
import authRouter from "./auth";
import cors from "cors";

let gameServerRef: Server;

export default config({
  options: {
    devMode: false,
  },

  initializeGameServer: (gameServer) => {
    // Define different map rooms
    gameServer.define("village", map);
    gameServer.define("forest", map);
    gameServer.define("dungeon", map);

    (async () => {
      await matchMaker.createRoom("village", {
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

      await matchMaker.createRoom("forest", {
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

      await matchMaker.createRoom("dungeon", {
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

//This file

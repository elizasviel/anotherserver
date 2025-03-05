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
    gameServer.define("field", map);

    (async () => {
      await matchMaker.createRoom("village", {
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
            targetY: 300,
          },
        ],
      });

      await matchMaker.createRoom("field", {
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
            targetY: 300,
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

import config from "@colyseus/tools";
import { Server } from "colyseus";
import { matchMaker } from "@colyseus/core";
import { map } from "./rooms/Map";
import { MONSTER_TYPES } from "./gameObjects";
import express from "express";
import authRouter from "./auth";
import cors from "cors";

let gameServerRef: Server;

const {
  snail,
  bee,
  boar,
  whiteBoar,
  blackBoar,
  blackWolf,
  whiteWolf,
  grayWolf,
  brownWolf,
} = MONSTER_TYPES;

export default config({
  options: {
    devMode: false,
  },

  initializeGameServer: (gameServer) => {
    // Define different map rooms
    gameServer.define("village", map);
    gameServer.define("village-main", map);
    gameServer.define("field", map);
    gameServer.define("field1", map);
    gameServer.define("field2", map);
    gameServer.define("field3", map);
    gameServer.define("house", map);
    (async () => {
      await matchMaker.createRoom("village", {
        path: "./src/maps/VillageMap.tmj",
        monsters: [
          {
            monsterType: snail,
            spawnInterval: 5000,
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
            isOneWayPlatform: false,
          },
          {
            id: "village-main-portal",
            x: 1550,
            y: 620,
            width: 64,
            height: 64,
            targetRoom: "village-main",
            targetX: 50,
            targetY: 1450,
            isOneWayPlatform: false,
          },
          {
            id: "house-portal",
            x: 1300,
            y: 620,
            width: 64,
            height: 64,
            targetRoom: "house",
            targetX: 100,
            targetY: 620,
            isOneWayPlatform: false,
          },
        ],
      });

      await matchMaker.createRoom("village-main", {
        path: "./src/maps/VillageMain.tmj",
        monsters: [],
        portals: [
          {
            id: "village-portal",
            x: 50,
            y: 1450,
            width: 64,
            height: 64,
            targetRoom: "village",
            targetX: 1550,
            targetY: 620,
            isOneWayPlatform: false,
          },
          {
            id: "field3-portal",
            x: 3150,
            y: 1450,
            width: 64,
            height: 64,
            targetRoom: "field3",
            targetX: 50,
            targetY: 620,
            isOneWayPlatform: false,
          },
        ],
      });

      await matchMaker.createRoom("field", {
        path: "./src/maps/FieldMap.tmj",
        monsters: [
          {
            monsterType: boar,
            spawnInterval: 5000,
            maxSpawned: 10,
          },
          {
            monsterType: whiteBoar,
            spawnInterval: 5000,
            maxSpawned: 5,
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
            isOneWayPlatform: false,
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
            isOneWayPlatform: false,
          },
        ],
      });

      await matchMaker.createRoom("field1", {
        path: "./src/maps/FieldMap1.tmj",
        monsters: [
          {
            monsterType: boar,
            spawnInterval: 5000,
            maxSpawned: 10,
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
            isOneWayPlatform: false,
          },
          {
            id: "field2-portal1",
            x: 50,
            y: 320,
            width: 64,
            height: 64,
            targetRoom: "field2",
            targetX: 50,
            targetY: 460,
            isOneWayPlatform: false,
          },
        ],
      });

      await matchMaker.createRoom("field2", {
        path: "./src/maps/FieldMap2.tmj",
        monsters: [
          {
            monsterType: bee,
            spawnInterval: 5000,
            maxSpawned: 10,
          },
          {
            monsterType: boar,
            spawnInterval: 5000,
            maxSpawned: 10,
          },
        ],
        portals: [
          {
            id: "field1-portal2",
            x: 50,
            y: 450,
            width: 64,
            height: 64,
            targetRoom: "field1",
            targetX: 50,
            targetY: 320,
            isOneWayPlatform: false,
          },
          {
            id: "",
            x: 50,
            y: 1375,
            width: 64,
            height: 64,
            targetRoom: "field3",
            targetX: 1400,
            targetY: 100,
            isOneWayPlatform: false,
          },
        ],
      });
      await matchMaker.createRoom("field3", {
        path: "./src/maps/FieldMap3.tmj",
        monsters: [
          {
            monsterType: blackWolf,
            spawnInterval: 5000,
            maxSpawned: 5,
          },
          {
            monsterType: brownWolf,
            spawnInterval: 5000,
            maxSpawned: 5,
          },
        ],
        portals: [
          {
            id: "",
            x: 50,
            y: 710,
            width: 64,
            height: 64,
            targetRoom: "village-main",
            targetX: 3150,
            targetY: 1450,
            isOneWayPlatform: false,
          },
          {
            id: "",
            x: 1400,
            y: 100,
            width: 64,
            height: 64,
            targetRoom: "field2",
            targetX: 50,
            targetY: 1375,
            isOneWayPlatform: false,
          },
        ],
      });

      await matchMaker.createRoom("house", {
        path: "./src/maps/HouseMap.tmj",
        monsters: [],
        portals: [
          {
            id: "house-portal",
            x: 100,
            y: 590,
            width: 64,
            height: 64,
            targetRoom: "village",
            targetX: 1300,
            targetY: 620,
            isOneWayPlatform: false,
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
        origin: [
          "http://localhost:2567",
          "http://localhost:1234",
          "http://localhost:3000",
          "https://platformerclient-5a4e26f76ab1.herokuapp.com/",
        ],
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

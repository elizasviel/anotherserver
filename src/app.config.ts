import config from "@colyseus/tools";
import { Server } from "colyseus";
import { matchMaker } from "@colyseus/core";
import { MONSTER_TYPES } from "./gameObjects";
import { map } from "./rooms/Map";

let gameServerRef: Server;

const { slime, goblin, skeleton, boar } = MONSTER_TYPES;

export default config({
  options: {
    devMode: false,
  },

  initializeGameServer: (gameServer) => {
    // Define different map rooms
    gameServer.define("village", map);
    gameServer.define("forest", map);
    gameServer.define("dungeon", map);

    // Create the village map with a portal to the forest
    (async () => {
      await matchMaker.createRoom("village", {
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
      await matchMaker.createRoom("forest", {
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
      await matchMaker.createRoom("dungeon", {
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

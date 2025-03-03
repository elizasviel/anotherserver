import config from "@colyseus/tools";
import { Server } from "colyseus";
import { matchMaker } from "@colyseus/core";
import { MONSTER_TYPES } from "./gameObjects";
import { map } from "./rooms/Map";

let gameServerRef: Server;

export const playerRegistry = new Map<string, string>();

const { slime, goblin, skeleton, boar } = MONSTER_TYPES;

export default config({
  options: {
    devMode: false,
  },

  initializeGameServer: (gameServer) => {
    gameServer.define("village", map);
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
      });
    })();

    gameServerRef = gameServer;
  },
});

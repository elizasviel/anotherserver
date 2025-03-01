import config from "@colyseus/tools";
import { Server } from "colyseus";
import { matchMaker } from "@colyseus/core";
import { Village } from "./rooms/Village";

let gameServerRef: Server;

export const playerRegistry = new Map<string, string>();

export default config({
  options: {
    devMode: false,
  },

  initializeGameServer: (gameServer) => {
    gameServer.define("village", Village);
    (async () => {
      await matchMaker.createRoom("village", {});
    })();

    gameServerRef = gameServer;
  },
});

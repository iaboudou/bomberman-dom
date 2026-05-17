import { Room } from "./src/models/Room.js";
import { GameHandler } from "./src/models/GameHandler.js";
import { WebSocketServer } from "ws";
import { Player } from "./src/models/Player.js";

function startServer() {

  // initialize room Management
  const rooms = new Map();
  const mainRoom = new Room("global-1");
  rooms.set(mainRoom.id, mainRoom);

  // setup game handler for the room
  const gameHandler = new GameHandler(mainRoom);

  // setup web socket server
  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {

    let player = null;

    // handle client messages
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        
        switch (message.type) {
          case "JOIN":
            break;

          case "MOVE":
            break;

          case "BOMB":
            break;

          case "CHAT":
            break;
        }
      } catch{}
    });

    // handle client disconnection
    ws.on("close", () => {
      if (player) mainRoom.removePlayer(player.id);
    });
  });
}

startServer();

import { WebSocketServer } from "ws";
import { Player } from "./src/Player.js";
import { startroomgame } from "./src/Room.js";
import { GameMap } from "./src/Map.js";

function startServer() {
  const { mainRoom, gameHandler } = startroomgame();
  let map = new GameMap();
  map.generateBlock();

  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    let player = null;

    // handle client messages
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);

        console.log(message);

        switch (message.type) {
          case "JOIN":
            player = new Player(message.data.nickname, ws, 0, 0);
            const joined = mainRoom.addPlayer(player);
            if (joined) {
              ws.send(
                JSON.stringify({
                  type: "JOIN_SUCCESS",
                  data: { nickname: player.nickname },
                }),
              );
            } else {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  data: { message: "Room is full" },
                }),
              );
            }
            break;

          case "MAP_INIT": {
            ws.send(
              JSON.stringify({
                type: message.type,
                data: {
                  grid: map.grid,
                  tiles: { empty: 0, wall: 1, block: 2 },
                },
              }),
            );
            break;
          }

          case "MOVE":
            break;

          case "BOMB":
            break;

          case "CHAT":
            break;
        }
      } catch {}
    });

    // handle client disconnection
    ws.on("close", () => {
      if (player) mainRoom.removePlayer(player.id);
    });
  });
}

startServer();

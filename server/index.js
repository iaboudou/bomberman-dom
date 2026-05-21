import { WebSocketServer } from "ws";
import { Player } from "./src/Player.js";
import { startroomgame } from "./src/Room.js";
import { GameMap } from "./src/Map.js";

function startServer() {
  const { ROOM, gameHandler } = startroomgame();
  let map = new GameMap();
  map.generateBlock();

  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    let player = null;

    // handle client messages
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);

        switch (message.type) {
          case "JOIN":
            player = new Player(message.data.nickname, ws, 0, 0);
            const joined = ROOM.addPlayer(player);
            if (joined) {
              ws.send(
                JSON.stringify({
                  type: "JOIN_SUCCESS",
                  data: {
                    nickname: player.nickname,
                    players: ROOM.players.map(p => p.nickname)
                  },
                }),
              );
              ROOM.messages.forEach((msg) => {
                ws.send(
                  JSON.stringify({
                    type: "CHAT",
                    data: msg,
                  }),
                );
              });
              const playersPayload = JSON.stringify({
                type: "PLAYERS_UPDATE",
                data: { players: ROOM.players.map(p => p.nickname) },
              });
              ROOM.players.forEach((p) => {
                p.socket.send(playersPayload);
              });
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
            const nickname = player ? player.nickname : message.nickname;
            ROOM.chatHandler.handleMessage(nickname, message.message);
            break;
        }
      } catch { }
    });

    // handle client disconnection
    ws.on("close", () => {
      if (player) {
        ROOM.removePlayer(player.nickname);
        const playersPayload = JSON.stringify({
          type: "PLAYERS_UPDATE",
          data: { players: ROOM.players.map(p => p.nickname) },
        });
        ROOM.players.forEach((p) => {
          if (p.socket && p.socket.readyState === 1)
            p.socket.send(playersPayload);
        });
      }
    });
  });
}

startServer();

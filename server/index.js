import { WebSocketServer } from "ws";
import { Player } from "./src/Player.js";
import { startroomgame } from "./src/Room.js";

function startServer() {
  const { mainRoom, gameHandler } = startroomgame();

  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    let player = null;

    // handle client messages
    ws.on("message", (data) => {

      try {
        const message = JSON.parse(data);

        switch (message.type) {
          case "JOIN":
            console.log("Player JOIN:", message.data);
            player = new Player(message.data.nickname, ws, 0, 0);
            const joined = mainRoom.addPlayer(player);
            if (joined) {
              ws.send(JSON.stringify({
                type: "JOIN_SUCCESS",
                data: { nickname: player.nickname }
              }));
            } else {
              ws.send(JSON.stringify({ type: "ERROR", data: { message: "Room is full" } }));
            }
            break;

          case "MOVE":
            break;

          case "BOMB":
            break;

          case "CHAT":
            break;
        }
      } catch { }
    });

    // handle client disconnection
    ws.on("close", () => {
      if (player) mainRoom.removePlayer(player.id);
    });
  });
}

startServer();

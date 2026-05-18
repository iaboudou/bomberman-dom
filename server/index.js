import { WebSocketServer } from "ws";
import { Player } from "./src/Player.js";
import { startroomgame } from "./src/Room.js";

function startServer() {
  const { mainRoom, gameHandler } = startroomgame();

  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {

    const playerId = "P_" + crypto.randomUUID()
    console.log(playerId)
    let player = null;

    ws.send(JSON.stringify({
      type: "WELCOME",
      data: { playerId }
    }));

    // handle client messages
    ws.on("message", (data) => {

      try {
        const message = JSON.parse(data);

        switch (message.type) {
          case "JOIN":
            console.log(message.toString())
            ws.send("hello: " + message.data.toString())
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

import { WebSocketServer } from "ws";
import { Room } from "./src/states/Room.js";
import { MoovePlayer } from "./src/logic/moove.js";
import { joinGame } from "./src/logic/join.js";
import { dropBomb } from "./src/logic/dropBomb.js";
import { broadcastMessage } from "./src/logic/chat.js";

function startServer() {
  const room = new Room(crypto.randomUUID());
  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    let clientName;

    ws.on("message", (message) => {
      try {
        const { type, data } = JSON.parse(message);

        switch (type) {
          case "JOIN": {
            const success = joinGame(room, data.nickname, ws);
            if (success) {
              clientName = data.nickname;
              if (room.clients.length === 4) {
                room.startCountdown();
              }
            }
            break;
          }

          case "CHAT": {
            broadcastMessage(clientName, data.message, room);
            break;
          }

          case "MOOVE": {
            const player = room.players.find((p) => p.nickname === clientName);
            MoovePlayer(data.direction, player, room);
            break;
          }

          case "BOMB": {
            const player = room.players.find((p) => p.nickname === clientName);
            dropBomb(room, player);
            break;
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    ws.on("close", () => {
      if (clientName) {
        room.removeClient(clientName);
      }
    });
  });
}

startServer();

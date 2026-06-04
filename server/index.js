import { WebSocketServer } from "ws";
import { Room } from "./src/states/Room.js";
import { broadcastNewPlayer, sendTofront } from "./src/utils/Utils.js";
import { Bomb } from "./src/entities/Bomb.js";

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
            const result = room.addClient(data.nickname, ws);

            if (result === "success") {
              sendTofront(ws, "JOIN_SUCCESS", {
                nickname: data.nickname,
                roomMates: room.clients.map((c) => ({
                  nickname: c.nickname,
                })),
              });
              clientName = data.nickname;
              broadcastNewPlayer(room.clients, clientName);
            } else sendTofront(ws, "NICKNAME_ERROR", { message: result });

            break;
          }

          case "CHAT": {
            let receivers;

            if (room.status === "WAITING") receivers = room.clients;
            else if (room.status === "COUNTDOWN") receivers = room.players;
            else break;

            broadcastMessage(clientName, data.message, receivers);
            break;
          }

          case "MOOVE": {
            const player = room.players.find((p) => (p.nickname = clientName));
            MoovePlayer(data.direction, player, room);
          }

          case "BOMB": {
            const player = room.players.find((p) => (p.nickname = clientName));
            if (!player.canPlaceBomb() || player.isDead()) break;

            const bombOnCell = ROOM.bombs.some(
              (b) => b.x === player.x && b.y === player.y,
            );

            if (bombOnCell) break;

            const bomb = new Bomb(player.x, player.y, player.range);

            player.activeBombs++;

            const tid = setTimeout(() => {
              player.activeBombs--;
              triggerExplosion(bomb, gameHandler.ROOM.map, ROOM);
            }, bomb.duration);
            ROOM.pendingTimeouts.push(tid);

            room.players.forEach((p) =>
              sendTofront(p.socket, "BOMB_PLACED", { bomb }),
            );
            break;
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    ws.on("close", () => room.removeClient(clientName));
  });
}

startServer();

import { WebSocketServer } from "ws";
import { Player } from "./src/Player.js";
import { Room, startroomgame } from "./src/Room.js";
import { GameMap } from "./src/Map.js";
import { Bomb } from "./src/Bomb.js";
import { spawnPoints } from "./src/Const.js";
import { broadcastNewPlayer, broadCastPlayerLeft, MoovePlayer, removeAllTimer, sendJoinSuccess, sendMapInfo, sendRoomIsFull, triggerExplosion } from "./src/Utils.js";

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
          case "JOIN": {
            const spawn = spawnPoints[ROOM.players.length];
            const newPlayer = new Player(message.data.nickname, ws, spawn.x, spawn.y);
            const joined = ROOM.addPlayer(newPlayer);

            if (joined) {
              sendJoinSuccess(ws, ROOM.players, newPlayer, ROOM.messages)
              broadcastNewPlayer(ROOM.players, newPlayer)

            } else {
              sendRoomIsFull(ws)
            }         

            player = newPlayer
            break;
          }

          case "CHAT": {
            const nickname = player ? player.nickname : message.nickname;
            ROOM.chatHandler.handleMessage(nickname, message.message);
            break;
          }

          case "SWITCH_TO_GAME_MAP": {
            removeAllTimer(ROOM)
            sendMapInfo(ROOM.players, map)
            break;
          }

          case "MOVE": {
              if (ROOM.spectators.some(s => s.id === player?.id)) break;
            MoovePlayer(message.data.direction, player, map, ROOM)
            break;
          }

          case "BOMB": {
              if (ROOM.spectators.some(s => s.id === player?.id)) break;
            if (!player.canPlaceBomb()) break;

            const bomb = new Bomb(player.x, player.y, player.range);

            player.activeBombs++;

            ROOM.bombs.push(bomb);

            const everyone = [...ROOM.players, ...ROOM.spectators];
            everyone.forEach((p) => {
            if (p.socket && p.socket.readyState === 1) {
              p.socket.send(JSON.stringify({
                  type: "BOMB_PLACED",
                  data: { bomb },
                }));
              }
            });

            setTimeout(() => {
              player.activeBombs --;
              triggerExplosion(bomb, map, ROOM)
            }, bomb.duration);

            break;
          }
        }
      } catch (err) {
      console.error("WebSocket message error:", err);
      }
    });

    // handle client disconnection
    ws.on("close", () => {
      if (player) {
        const playerLeft = player.nickname
        ROOM.removePlayer(playerLeft);
        broadCastPlayerLeft(ROOM.players, playerLeft)
        player = null
      }
    });
  });
}

startServer();

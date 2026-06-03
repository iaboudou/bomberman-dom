import { WebSocketServer } from "ws";
import { Player } from "./src/Player.js";
import { Room, startroomgame } from "./src/Room.js";
import { GameMap } from "./src/Map.js";
import { Bomb } from "./src/Bomb.js";
import { spawnPoints } from "./src/Const.js";
import {
  broadcastNewPlayer,
  broadCastPlayerLeft,
  MoovePlayer,
  removeAllTimer,
  sendJoinSuccess,
  sendMapInfo,
  sendNameAlreadyUsed,
  sendRoomIsFull,
  triggerExplosion,
} from "./src/Utils.js";

function startServer() {
  const { ROOM, gameHandler } = startroomgame();
  let map = gameHandler.ROOM.map;
  // ROOM.map = map;

  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    let player = null;

    // handle client messages
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);

        switch (message.type) {
          case "JOIN": {
            if (ROOM.isFull()) {
              sendRoomIsFull(ws);
              break;
            }

            if (ROOM.hasNickname(message.data.nickname)) {
              sendNameAlreadyUsed(ws);
              break;
            }

            const number = ROOM.getNumberForPlayer()
            const spawn = spawnPoints[number-1];
            const newPlayer = new Player(
              message.data.nickname,
              ws,
              spawn.x,
              spawn.y,
              number,
            );

            const joined = ROOM.addPlayer(newPlayer);

            if (joined) {
              sendJoinSuccess(ws, ROOM.players, newPlayer);
              broadcastNewPlayer(ROOM.players, newPlayer);
              player = newPlayer;
            } else {
              sendRoomIsFull(ws);
            }

            break;
          }

          case "CHAT": {
            if (!player) break;
            ROOM.chatHandler.handleMessage(player.nickname, message.message);
            break;
          }

          case "SWITCH_TO_GAME_MAP": {
            if (!player) break;
            removeAllTimer(ROOM);
            sendMapInfo(ROOM.players, gameHandler.ROOM.map, ROOM.powerups);
            break;
          }

          case "MOVE": {
            if (!player) break;
            if (ROOM.spectators.some((s) => s.id === player?.id)) break;
            MoovePlayer(
              message.data.direction,
              player,
              gameHandler.ROOM.map,
              ROOM
            );
            break;
          }

          case "BOMB": {
            if (!player) break;
            if (ROOM.spectators.some((s) => s.id === player?.id)) break;
            if (!player.canPlaceBomb()) break;

            const bombOnCell = ROOM.bombs.some((b) => b.x === player.x && b.y === player.y);
            if (bombOnCell) break;

            const bomb = new Bomb(player.x, player.y, player.range);

            player.activeBombs++;

            // schedule explosion
            const tid = setTimeout(() => {
              player.activeBombs--;
              triggerExplosion(bomb, gameHandler.ROOM.map, ROOM);
            }, bomb.duration);
            ROOM.pendingTimeouts.push(tid);

            ROOM.bombs.push(bomb);

            const everyone = [
              ...(ROOM?.players || []),
              ...(ROOM?.spectators || []),
            ];
            everyone.forEach((p) => {
              if (p.socket && p.socket.readyState === 1) {
                p.socket.send(
                  JSON.stringify({
                    type: "BOMB_PLACED",
                    data: { bomb },
                  })
                );
              }
            });

            break;
          }

          case "RESET_GAME": {

            removeAllTimer(ROOM);
            const map = new GameMap();
            map.generateBlock();
            ROOM.map = map;
            ROOM.explosionCells = [];

            const allPlayers = [...ROOM.players, ...ROOM.spectators];
            ROOM.spectators = [];
            ROOM.players = allPlayers.map((p, i) => {
              const spawn = spawnPoints[i];
              p.x = spawn.x;
              p.y = spawn.y;
              p.direction = "down";
              p.maxBombs = 1;
              p.activeBombs = 0;
              p.range = 2;
              p.maxlife = 3;
              p.remaininglife = 3;
              p.speed = 1;
              p._lastMove = 0;
              return p;
            });

            ROOM.bombs = [];
            ROOM.powerups = [];

            ROOM.status = "WAITING";
            ROOM.waitingTime = 0;
            ROOM.countdown = 0;

            if (ROOM.players.length === 2) {
              ROOM.startWaitingTimer();
            } else if (ROOM.players.length === 4) {
              ROOM.startCountdown();
            }

            if (ROOM.players.length <= 1) break;
            const everyone = [...ROOM.players, ...ROOM.spectators];
            sendMapInfo(everyone, map, ROOM.powerups);
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
        const playerLeft = player.id;
        ROOM.removePlayer(playerLeft);
        ///
        if (ROOM.players.length <= 1) {
          const winner = ROOM.players[0] || null;
          const everyone = [
            ...(ROOM?.players || []),
            ...(ROOM?.spectators || []),
          ];
          everyone.forEach((p) => {
            if (p.socket && p.socket.readyState === 1) {
              if (ROOM.status == "WAITING" || ROOM.status == "COUNTDOWN") {
                p.socket.send(
                  JSON.stringify({
                    type: "WAINTING_OR_COUNTDOWN_TIMER",
                    data: {
                      waitingTime: 0,
                      type: "WAITING",
                      players: everyone,
                    },
                  })
                );
                ROOM.status = "WAITING";
                return;
              }
              ROOM.removePlayer(p.id);
              p.socket.send(
                JSON.stringify({
                  type: "GAME_OVER",
                  data: {
                    winner: winner
                      ? {
                        id: winner.id,
                        nickname: winner.nickname,
                        players: ROOM.players,
                      }
                      : null,
                  },
                })
              );
            }
          });
          return;
        }
        /////
        broadCastPlayerLeft(ROOM.players, playerLeft);
        player = null;
      }
    });
  });
}

startServer();

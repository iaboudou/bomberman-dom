import { WebSocketServer } from "ws";
import { Player } from "./src/Player.js";
import { startroomgame } from "./src/Room.js";
import { GameMap } from "./src/Map.js";
import { Bomb } from "./src/Bomb.js";
import { collectPowerUp, spawnPowerUp } from "./src/PowerUp.js";

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

            ///////
            const spawnPoints = [
              { x: 1, y: 1 },
              { x: map.grid[0].length - 2, y: 1 },
              { x: map.grid[0].length - 2, y: map.grid.length - 2 },
              { x: 1, y: map.grid.length - 2 },
            ];

            const spawn = spawnPoints[ROOM.players.length];
            //////

            player = new Player(message.data.nickname, ws, spawn.x, spawn.y);
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
                  tiles: map.TILES,
                  players: ROOM.players.map((player) => ({
                    id: player.id,
                    nickname: player.nickname,
                    x: player.x,
                    y: player.y,
                    direction: player.direction,
                    remaininglife: player.remaininglife,
                    maxlife: player.maxlife,
                  })),
                },
              }),
            );
            break;
          }

          case "MOVE":
            if (!player || !player.canMove()) break;

            const direction = message.data.direction;

            let nx = player.x;
            let ny = player.y;

            if (direction === "ArrowUp") ny--;
            if (direction === "ArrowDown") ny++;
            if (direction === "ArrowLeft") nx--;
            if (direction === "ArrowRight") nx++;

            console.log("nx, ny", nx, ny);
            if (map.isWalkable(ny, nx)) {

              player.moove(nx, ny, direction);
              player.registerMove();
              ///////////
              console.log("before", ROOM.powerups.length);
              ROOM.powerups = collectPowerUp(player, ROOM.powerups);
              console.log("after", ROOM.powerups.length);
              //////////
              ROOM.players.forEach((p) => {
                if (p.socket && p.socket.readyState === 1) {
                  p.socket.send(JSON.stringify({
                    type: "PLAYERS_STATE",
                    data: {
                      powerups: ROOM.powerups,
                      players: ROOM.players.map((player) => ({
                        id: player.id,
                        nickname: player.nickname,
                        x: player.x,
                        y: player.y,
                        direction: player.direction,
                        remaininglife: player.remaininglife,
                        maxlife: player.maxlife,
                      })),
                    },
                  }));
                }
              });
            }
            break;

          case "CHAT":
            const nickname = player ? player.nickname : message.nickname;
            ROOM.chatHandler.handleMessage(nickname, message.message);
            break;

          case "SWITCH_TO_GAME_MAP":
            ////
            if (ROOM.setInterval_waitingTimer) {
              clearInterval(ROOM.setInterval_waitingTimer);
              ROOM.setInterval_waitingTimer = null;
            }
            if (ROOM.setInterval_countdownTimer) {
              clearInterval(ROOM.setInterval_countdownTimer);
              ROOM.setInterval_countdownTimer = null;
            }
            ROOM.waitingTime = 0;
            ROOM.countdown = 0;
            ROOM.status = "INGAME";
            ////
            ROOM.players.forEach((p) => {
              if (p.socket && p.socket.readyState === 1) {
                p.socket.send(JSON.stringify({
                  type: "MAP_INIT",
                  data: {
                    grid: map.grid,
                    tiles: map.TILES,
                    players: ROOM.players.map((player) => ({
                      id: player.id,
                      nickname: player.nickname,
                      x: player.x,
                      y: player.y,
                      direction: player.direction,
                      remaininglife: player.remaininglife,
                      maxlife: player.maxlife,
                    })),
                  },
                }));
              }
            });
            break;

          case "BOMB": {
            if (!player || !player.canPlaceBomb()) break;

            const bomb = new Bomb(player.x, player.y, player.range);

            player.activeBombs++;
            ROOM.bombs.push(bomb);

            ROOM.players.forEach((p) => {
              if (p.socket && p.socket.readyState === 1) {
                p.socket.send(JSON.stringify({
                  type: "BOMB_PLACED",
                  data: { bomb },
                }));
              }
            });

            setTimeout(() => {
              const cells = bomb.explode(map);

              cells.forEach(({ x, y }) => {
                if (map.grid[y][x] === map.TILES.block) {
                  map.removeBlock(y, x);

                  const powerUp = spawnPowerUp(x, y);
                  if (powerUp) {
                    ROOM.powerups.push(powerUp);
                  }
                }

                ROOM.players.forEach((p) => {
                  if (p.x === x && p.y === y) {
                    p.loseLife();
                  }
                });
              });

              player.activeBombs--;
              ROOM.bombs = ROOM.bombs.filter((b) => b.id !== bomb.id);
              ROOM.players = ROOM.players.filter((p) => !p.isDead());

              ROOM.players.forEach((p) => {
                if (p.socket && p.socket.readyState === 1) {
                  p.socket.send(JSON.stringify({
                    type: "BOMB_EXPLODED",
                    data: {
                      bombId: bomb.id,
                      cells,
                      grid: map.grid,
                      bombs: ROOM.bombs,
                      powerups: ROOM.powerups,
                      players: ROOM.players.map((player) => ({
                        id: player.id,
                        nickname: player.nickname,
                        x: player.x,
                        y: player.y,
                        direction: player.direction,
                        remaininglife: player.remaininglife,
                        maxlife: player.maxlife,
                      })),
                    },
                  }));
                }
              });
            }, bomb.duration);

            break;
          }
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

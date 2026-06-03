import { spawnPoints } from "./Const.js";
import { GameMap } from "./Map.js";

export class GameHandler {
  // handles communication between server and clients for a game session
  constructor(ROOM) {
    this.clients = new Map();
    this.ROOM = ROOM;
  }

  startGame() {
    this.ROOM.spectators = [];
    this.ROOM.bombs = [];
    this.ROOM.powerups = [];
    this.ROOM.map = new GameMap(); ///////
    this.ROOM.map.generateBlock(); /////
    this.ROOM.explosionCells= [];

    this.ROOM.players.forEach((p, i) => {
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

      if (p.socket && p.socket.readyState == 1) {
        p.socket.send(
          JSON.stringify({
            type: "MAP_INIT",
            data: {
              grid: this.ROOM.map.grid,
              tiles: this.ROOM.map.TILES,
              classes: this.ROOM.map.classes,
              players: this.ROOM.players.map((player) => ({
                id: player.id,
                number: player.number,
                nickname: player.nickname,
                x: player.x,
                y: player.y,
                direction: player.direction,
                remaininglife: player.remaininglife,
                maxlife: player.maxlife,
              })),
            },
          })
        );
      }
    });
  }

  // Sends the current game state to all connected players
  broadcastState(time, Type) {
    this.ROOM.players.forEach((p) => {
      if (p.socket && p.socket.readyState == 1) {
        p.socket.send(
          JSON.stringify({
            type: "WAINTING_OR_COUNTDOWN_TIMER",
            data: {
              waitingTime: time,
              type: Type,
            },
          })
        );
      }
    });
  }
}

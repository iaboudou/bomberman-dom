export class GameHandler {
  // handles communication between server and clients for a game session
  constructor(ROOM) {
    this.clients = new Map();
    this.ROOM = ROOM;
  }


  startGame() {
    this.ROOM.players.forEach((p) => {
      if (p.socket && p.socket.readyState == 1) {
        p.socket.send(JSON.stringify({
          type: "MAP_INIT",
          data: {
            grid: this.ROOM.map.grid,
            tiles: this.ROOM.map.TILES,
            classes: this.ROOM.map.classes,
            players: this.ROOM.players.map((player) => ({
              id: player.id,
              nickname: player.nickname,
              x: player.x,
              y: player.y,
              direction: player.direction,
              remaininglife: player.remaininglife,
              maxlife: player.maxlife,
            })),
          },
        }))
      }
    })
  }

  // Sends the current game state to all connected players
  broadcastState(time, Type) {
    this.ROOM.players.forEach((p) => {
      if (p.socket && p.socket.readyState == 1) {
        p.socket.send(JSON.stringify({
          type: "WAINTING_OR_COUNTDOWN_TIMER",
          data: {
            waitingTime: time,
            type: Type,
          }
        }))
      }
    })
  }
}

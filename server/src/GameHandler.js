export class GameHandler {
  // handles communication between server and clients for a game session
  constructor(ROOM) {
    this.clients = new Map();
    this.ROOM = ROOM;
  }

  // resets the game state for a new session
  resetGame() { }

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

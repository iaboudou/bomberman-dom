export class GameHandler {
  // handles communication between server and clients for a game session
  constructor(ROOM) {

    this.clients = new Map();
    this.ROOM = ROOM;
  }

  // processes actions sent by a player
  // find the player in the room and handle the action is it possible or not and update 
  // the player state and broadcast the new state to all players
  handleAction(playerId, action) { }

  // Handles a player request to place a bomb
  handleBombPlacement(playerId) { }

  // Initiates the game start sequence
  startGame() { }

  // handles the end of a game session
  endGame(winnerId) { }

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

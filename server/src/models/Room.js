import { GameMap } from "./Map.js";

export class Room {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.map = new GameMap(15, 15);
    // WAITING - COUNTDOWN - INGAME - FINISHED
    this.status = "WAITING";
    this.createdAt = Date.now();
  }

  // Adds a new player to the room
  addPlayer(player) { }

  // Removes a player from the room on disconnect
  removePlayer(playerId) { }

  // Checks if the room has reached the maximum number of players (4)
  isFull() { }

  // Starts the 20-seconds waiting timer if > 2 players
  startWaitingTimer() { }

  // Starts the 10-seconds countdown before the game begins
  startCountdown() { }
}

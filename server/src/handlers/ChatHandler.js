export class ChatHandler {
  // handles chat messages between players
  constructor(room) {
    this.room = room;
  }

  // Validates and formats a chat message
  handleMessage(playerId, text) { }

  // broadcasts a message to all players in the room
  broadcastMessage(message) { }
}

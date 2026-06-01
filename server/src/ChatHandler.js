export class ChatHandler {
  constructor(room) {
    this.room = room;
  }

  // Validates and formats a chat message
  handleMessage(nickname, text) {
    if (!text || typeof text !== "string") return;
    const TEXT = text.trim();
    if (TEXT.length === 0 || TEXT.length > 100) return;

    const player = this.room.players.find(p => p.nickname === nickname);
    const message = {
      id: crypto.randomUUID(),
      message: TEXT,
      nickname: player.nickname
    };

    // this.room.messages.push(message);
    this.broadcastMessage(message);
  }

  // broadcasts a message to all players in the room
  broadcastMessage(message) {
    this.room.players.forEach((p) => {
      if (p.socket && p.socket.readyState === 1) {
        p.socket.send(
          JSON.stringify({
            type: "CHAT",
            data: message,
          }),
        );
      }
    });
  }
}

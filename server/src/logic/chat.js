import { sendTofront } from "../utils/Utils.js";

export function broadcastMessage(nickname, text, room) {
    if (!text || typeof text !== "string") return;

    let receivers;

    if (room.status === "WAITING") receivers = room.clients;
    else if (room.status === "COUNTDOWN") receivers = room.players;
    else return;

    const TEXT = text.trim();
    if (TEXT.length === 0 || TEXT.length > 100) return;

    const message = {
        id: crypto.randomUUID(),
        message: TEXT,
        nickname,
    };

    receivers.forEach((p) => {
        sendTofront(p.socket, "CHAT", message);
    });
}

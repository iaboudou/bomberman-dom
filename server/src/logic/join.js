import { sendTofront } from "../utils/Utils.js";

export function joinGame(room, newPlayer, ws) {
    const result = room.addClient(newPlayer, ws);

    if (result === "success") {
        room.clients.forEach((p) => {
            if (p.nickname === newPlayer) {
                sendTofront(ws, "JOIN_SUCCESS", {
                    nickname: newPlayer,
                    roomMates: room.clients.map((c) => ({
                        nickname: c.nickname,
                    })),
                });

            } else sendTofront(p.socket, "NEW_PLAYER", { nickname: newPlayer })
        });
        
        return true
    }

    sendTofront(ws, "NICKNAME_ERROR", { message: result });

    return false
}
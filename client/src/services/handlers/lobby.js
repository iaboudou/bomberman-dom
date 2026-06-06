import { store, useState } from "../../../mini-framework/index.js";

export function showMessage(data) {
    const [msgs, setMsgs] = useState("chatMessages");
    const next = [...msgs, data];
    setMsgs(next.slice(-10));
}

export function updateTimer(data) {
    const [lobbyTimer, setLobbyTimer] = useState("lobbyTimer", {
        type: null,
        value: 0,
    });
    if (lobbyTimer.type === data.type && lobbyTimer.value === data.waitingTime)
        return;
    setLobbyTimer({ type: data.type, value: data.waitingTime });

    if (data?.players) {
        store.set({ players: data.players });
    }
}
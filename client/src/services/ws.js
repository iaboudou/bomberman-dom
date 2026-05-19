import { store } from "../../mini-framework/index.js";

let ws = null;

export function startWebsocketService() {
    ws = new WebSocket(`http://localhost:8080`);

    ws.onopen = () => {
        console.log('connected to the ws');
    };

    ws.onmessage = (event) => {
        let message;
        try {
            message = JSON.parse(event.data);
            console.log(message)
        } catch {
            return;
        }
        const { type, data } = message;
        switch (type) {
            case 'JOIN_SUCCESS': {
                store.set({
                    nickname: data.nickname,
                    screen: "lobby"
                });
                break;
            }
            case 'ERROR': {
                store.set({ error: data.message });
                break;
            }
        }

    }
}

export function joinGame(nickname) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "JOIN", data: { nickname } }));
    }
}

export function sendChatMessage(message) { }
export function sendMove(direction) { }
export function sendBomb() { }
import { store, useState } from "../../mini-framework/index.js";
import { GameMap } from "../core/Map.js";

let ws = null;
export const map = {}
export function startWebsocketService() {
  ws = new WebSocket(`http://localhost:8080`);

  ws.onopen = () => {
    console.log("connected to the ws");
  };

  ws.onmessage = (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
      console.log(message);
    } catch {
      return;
    }

    const { type, data } = message;
    switch (type) {
      case "JOIN_SUCCESS": {
        store.set({
          nickname: data.nickname,
          screen: "lobby",
        });

        break;
      }

      case "MAP_INIT": {
        map.grid = data.grid;
        map.tiles = data.tiles;
        const [screen, setScreen] = useState("screen");
        setScreen("game");
        break;
      }

      case "ERROR": {
        store.set({ error: data.message });
        break;
      }
    }
  };
}

export function joinGame(nickname) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "JOIN", data: { nickname } }));
  }
}

export function getMap() {
  ws.send(JSON.stringify({ type: "MAP_INIT" }));
}

export function sendChatMessage(message) {}
export function sendMove(direction) {}
export function sendBomb() {}

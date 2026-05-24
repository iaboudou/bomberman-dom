import { useState, store, router } from "../../mini-framework/index.js";
import { Player } from "../core/Player.js";

export let ws = null;
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
    } catch {
      return;
    }

    const { type, data } = message;
    switch (type) {
      case "JOIN_SUCCESS": {
        const [, setNickname] = useState("nickname", null, null);
        const [, setScreen] = useState("screen");

        setNickname(data.nickname);
        setScreen("lobby");

        const [, setPlayer] = useState("players");
        setPlayer(data.players);
        break;
      }

      case "CHAT": {
        const [msgslist, setchatMsg] = useState("chatMessages");
        setchatMsg([...msgslist, data]);
        break;
      }

      case "PLAYERS_UPDATE": {
        const [, setPlayers] = useState("players");
        setPlayers(data.players);
        break;
      }

      case "PLAYERS_STATE": {
        console.log("PLAYERS_STATE", data);
        const [, setPlayers] = useState("players", []);
        setPlayers(data.players);

        const [, setPowerups] = useState("powerups", []);
        setPowerups(data.powerups || []);
        router.render();
        break;
      }

      case "MAP_INIT": {
        map.grid = data.grid;
        map.tiles = data.tiles;

        const [, setPlayers] = useState("players");
        setPlayers(data.players);

        const [nickname] = useState("nickname");
        const currentPlayer = data.players.find((p) => p.nickname === nickname);

        const [, setCurrentPlayer] = useState("currentPlayer");
        setCurrentPlayer(currentPlayer);

        const [, setScreen] = useState("screen");
        setScreen("game");

        break;
      }

      case "WAINTING_OR_COUNTDOWN_TIMER": {
        console.log("timer data", data);
        const [, setWaitingTime] = useState("waitingTime")
        const [, setCountDown] = useState("countdown")
        if (data.type == "waitingTime") {
          setWaitingTime(data.waitingTime)
          setCountDown(0)

        } else if (data.type == "countdown") {
          setCountDown(data.waitingTime)
          setWaitingTime(0)

        }

        if (store.get("screen") === "lobby") {
          router.render();
        }
        break;
      }

      case "BOMB_PLACED": {
        const [bombs, setBombs] = useState("bombs", []);
        setBombs([...bombs, data.bomb]);
        router.render();
        break;
      }

      case "BOMB_EXPLODED": {
        map.grid = data.grid;

        const [currentMap, setMap] = useState("map");
        if (currentMap) {
          currentMap.grid = data.grid;
          setMap(currentMap);
        }

        const [, setBombs] = useState("bombs", []);
        setBombs(data.bombs);

        const [, setPlayers] = useState("players", []);
        setPlayers(data.players);

        const [, setPowerups] = useState("powerups", []);
        setPowerups(data.powerups || []);

        router.render();
        break;
      }


      case "ERROR": {
        const [, setError] = useState("error", null, null);
        setError(data.message);
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

export function sendChatMessage(message) {
  const [nickname] = useState("nickname");
  ws.send(JSON.stringify({
    type: "CHAT",
    message,
    nickname,
  }));
}
export function sendMove(direction) {
  ws.send(JSON.stringify({
    type: "MOVE",
    data: { direction },
  }));
}

export function sendBomb() {
  ws.send(JSON.stringify({
    type: "BOMB",
  }));
}
export function sendSwitchToGameMap() {
  ws.send(JSON.stringify({ type: "SWITCH_TO_GAME_MAP" }));
}
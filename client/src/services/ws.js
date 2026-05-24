import { useState, store, router } from "../../mini-framework/index.js";
import { Player } from "../entities/Player.js";

export let ws = null;
export const map = {}
export function startWebsocketService() {
  ws = new WebSocket(`http://localhost:8080`);

  ws.onopen = () => {
    console.log("connected to the ws");
  };

  ws.onerror = (err) => {
    console.log(err)
  }

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
        useState("nickname", data.nickname);
        useState("players", data.players);
        useState("chatMessages", data.messages);

        const [, setScreen] = useState("screen");
        setScreen("lobby");

        break;
      }

      case "CHAT": {
        const [msgslist, setchatMsg] = useState("chatMessages");
        setchatMsg([...msgslist, data]);
        break;
      }

      case "NEW_PLAYER" : {
        const [players, setPlayers] = useState("players");
        setPlayers([...players, data.newPlayer])
        break
      }

      case "PLAYER_LEFT": {
        const [players, setPlayers] = useState("players");
        setPlayers(players.filter(p => p !== data.left));
        break;
      }

      case "PLAYER_MOVED": {
      const [players, setPlayers] = useState("players", []);
  
      const updated = players.map((p) =>
        p.id === data.id ? { ...p, x: data.x, y: data.y, direction: data.direction }: p
      );

      setPlayers(updated);

      if (data.powerups) {
        const [, setPowerups] = useState("powerups");
        setPowerups(data.powerups);
      }

      break;
      }

      case "MAP_INIT": {
        const [nickname] = useState("nickname");
        const [, setPlayers] = useState("players");
        const [, setCurrentPlayer] = useState("currentPlayer");
        const [, setScreen] = useState("screen");
        
        map.grid = data.grid;
        map.tiles = data.tiles;
        map.classes = data.classes;

        setPlayers(data.players);
        const currentPlayer = data.players.find((p) => p.nickname === nickname);
        setCurrentPlayer(currentPlayer);

        setScreen("game");
        break;
      }

      case "WAINTING_OR_COUNTDOWN_TIMER": {

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
        break;
      }

      case "BOMB_EXPLODED": {
        const [bombs, setBombs] = useState("bombs", []);
        setBombs(bombs.filter((b) => b.id !== data.bombId));

        const [currentMap, setMap] = useState("map");
          if (data.removedBlocks.length > 0) {
            data.removedBlocks.forEach(({ x, y }) => {
            currentMap.grid[y][x] = map.tiles.empty
          });

        setMap(currentMap);
      }

      if (data.spawnedPowerups.length > 0) {
        const [powerups, setPowerups] = useState("powerups", []);
        setPowerups([...powerups, ...data.spawnedPowerups]);
      }

      const [players, setPlayers] = useState("players", []);
      const updated = players
      .filter((p) => !data.deadPlayers.includes(p.id))
      .map((p) => {
        const hit = data.affectedPlayers.find((ap) => ap.id === p.id);
        return hit ? { ...p, remaininglife: hit.remaininglife } : p;
      });

      setPlayers(updated);
      
      break;
      }

      case "YOU_DIED": {
        const [, setSpectator] = useState("spectator", false);
        setSpectator(true);
       break;
      }

      case "GAME_OVER": {
        const [, setWinner] = useState("winner", null);
        setWinner(data.winner);
        const [, setScreen] = useState("screen");
        setScreen("result");
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
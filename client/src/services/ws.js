import { useState, store, router } from "../../mini-framework/index.js";
import { GameMap } from "../entities/Map.js";

// ─── State
export let ws = null;
export const map = {};


// ─1 ── Connection
export function startWebsocketService() {
  ws = new WebSocket(`http://localhost:8080`);
  ws.onopen = () => console.log("connected to the ws");
  ws.onerror = (err) => console.log(err);
  ws.onmessage = onMessage;
}

// ─2 ── Message processing
function onMessage(event) {
  let message;
  try {
    message = JSON.parse(event.data);
  } catch {
    return;
  }
  const handler = handlers[message.type];
  if (handler) handler(message.data);
}


// ─3 ── Message handlers
const handlers = {

  JOIN_SUCCESS(data) {
    useState("nickname", data.nickname);
    useState("players", data.players);
    useState("chatMessages", data.messages);
    const [, setScreen] = useState("screen");
    setScreen("lobby");
  },

  CHAT(data) {
    const [msgs, setMsgs] = useState("chatMessages");
    setMsgs([...msgs, data]);
  },

  NEW_PLAYER(data) {
    const [players, setPlayers] = useState("players");
    setPlayers([...players, data.newPlayer]);
  },

  PLAYER_LEFT(data) {
    const [players, setPlayers] = useState("players");
    setPlayers(players.filter((p) => p !== data.left));
  },

  PLAYER_MOVED(data) {
    const [players, setPlayers] = useState("players", []);
    const updated = players.map((p) =>
      p.id === data.id
        ? { ...p, x: data.x, y: data.y, direction: data.direction }
        : p
    );
    setPlayers(updated);
    if (data.powerups) {
      const [, setPowerups] = useState("powerups");
      setPowerups(data.powerups);
    }
  },

  MAP_INIT(data) {
    const [nickname] = useState("nickname");
    const [, setPlayers] = useState("players");
    const [, setCurrentPlayer] = useState("currentPlayer");
    const [, setScreen] = useState("screen");
    const [, setMap] = useState("map");
    const [, setBombs] = useState("bombs", []);
    const [, setPowerups] = useState("powerups", []);
    const [, setSpectator] = useState("spectator", false);
    const [, setWinner] = useState("winner", null);
    map.grid = data.grid;
    map.tiles = data.tiles;
    map.classes = data.classes;
    setMap(new GameMap(data.grid, data.tiles));
    setPlayers(data.players);
    setCurrentPlayer(data.players.find((p) => p.nickname === nickname));
    setBombs([]);
    setPowerups([]);
    setSpectator(false);
    setWinner(null);
    setScreen("game");
  },

  WAINTING_OR_COUNTDOWN_TIMER(data) {
    const [, setWaitingTime] = useState("waitingTime");
    const [, setCountDown] = useState("countdown");
    if (data.type === "waitingTime") {
      setWaitingTime(data.waitingTime);
      setCountDown(0);
    } else if (data.type === "countdown") {
      setCountDown(data.waitingTime);
      setWaitingTime(0);
    }
    if (store.get("screen") === "lobby") router.render();
  },

  BOMB_PLACED(data) {
    const [bombs, setBombs] = useState("bombs", []);
    setBombs([...bombs, data.bomb]);
  },

  BOMB_EXPLODED(data) {
    const [bombs, setBombs] = useState("bombs", []);
    setBombs(bombs.filter((b) => b.id !== data.bombId));
    if (data.removedBlocks.length > 0) {
      const [currentMap, setMap] = useState("map");
      data.removedBlocks.forEach(({ x, y }) => {
        currentMap.grid[y][x] = map.tiles.empty;
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
  },

  YOU_DIED() {
    const [, setSpectator] = useState("spectator", false);
    setSpectator(true);
  },

  GAME_OVER(data) {
    const [, setWinner] = useState("winner", null);
    setWinner(data.winner);
    const [, setScreen] = useState("screen");
    setScreen("result");
  },

  RESET_GAME() {
    const [, setScreen] = useState("screen");
    setScreen("game");
    const [, setMap] = useState("map");
  },

  ERROR(data) {
    const [, setError] = useState("error", null, null);
    setError(data.message);
  },
};


// ─4 ── Actions 
function send(type, data = {}) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

export const joinGame = (nickname) => send("JOIN", { nickname });
export const getMap = () => send("MAP_INIT");
export const sendMove = (direction) => send("MOVE", { direction });
export const sendBomb = () => send("BOMB");
export const sendSwitchToGameMap = () => send("SWITCH_TO_GAME_MAP");
export const sendResetGame = () => send("RESET_GAME");

export function sendChatMessage(message) {
  const [nickname] = useState("nickname");
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "CHAT", message, nickname }));
  }
}
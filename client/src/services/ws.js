import { useState, store } from "../../mini-framework/index.js";
import { GameMap } from "../entities/Map.js";
import { initDoms, resetDoms } from "../views/game.js";

// ─── State
export let ws = null;
export const map = {};

// ─1 ── Connection
export function startWebsocketService() {
  ws = new WebSocket(`ws://localhost:8080`);
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
    useState("chatMessages", []);
    const [, setLobbyTimer] = useState("lobbyTimer", { type: null, value: 0 });
    setLobbyTimer({ type: null, value: 0 });
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
    setPlayers(players.filter((p) => p.id !== data.left));
  },

  PLAYER_MOVED(data) {
    const players = store.get("players") || [];
    store.set({ players: players.map((p) =>
      p.id === data.id
        ? { ...p, x: data.x, y: data.y, direction: data.direction }
        : p
    )});

    if (data.powerups) {
      store.set({ powerups: data.powerups });
    }

  },

  MAP_INIT(data) {
    const [nickname] = useState("nickname");
    map.grid    = data.grid;
    map.tiles   = data.tiles;
    map.classes = data.classes;

    store.set({ map:             new GameMap(data.grid, data.tiles) });
    store.set({ players:         data.players });
    store.set({ bombs:           [] });
    store.set({ powerups:        [] });
    store.set({ explosions:      [] });
    store.set({ spectator:       false });
    store.set({ winner:          null });

    const [, setScreen] = useState("screen");
    setScreen("game");

    requestAnimationFrame(() => initDoms());
  },

  WAINTING_OR_COUNTDOWN_TIMER(data) {
    const [lobbyTimer, setLobbyTimer] = useState("lobbyTimer", { type: null, value: 0 });
    if (lobbyTimer.type === data.type && lobbyTimer.value === data.waitingTime) return;
    setLobbyTimer({ type: data.type, value: data.waitingTime });
  },

  BOMB_PLACED(data) {
    const bombs = store.get("bombs") || [];
    store.set({ bombs: [...bombs, data.bomb] });
  },

  BOMB_EXPLODED(data) {
    const bombs = store.get("bombs") || [];
    store.set({ bombs: bombs.filter((b) => b.id !== data.bombId) });

    if (data.removedBlocks.length > 0) {
      const currentMap = store.get("map");
      data.removedBlocks.forEach(({ x, y }) => {
        currentMap.grid[y][x] = map.tiles.empty;
      });
      store.set({ map: { ...currentMap } }); // ← nouvelle référence
    }

    if (data.spawnedPowerups.length > 0) {
      const powerups = store.get("powerups") || [];
      store.set({ powerups: [...powerups, ...data.spawnedPowerups] });
    }

    if (data.explosionCells.length > 0) {
      const explosions = store.get("explosions") || [];
      store.set({ explosions: [...explosions, ...data.explosionCells] });
    }

    const players = store.get("players") || [];

    const updatedPlayers = players
    .filter((p) => !data.deadPlayers.includes(p.id))
    .map((p) => {
      const hit = data.affectedPlayers.find((ap) => ap.id === p.id);
      return hit ? { ...p, remaininglife: hit.remaininglife } : p;
    });

    store.set({ players: updatedPlayers });
    store.set({ playersLife: updatedPlayers });
  },

  REMOVE_EXPLOSIONS(data) {
    const explosions = store.get("explosions") || [];
    const idsToRemove = new Set(data.explosionCells.map(e => e.id));
    store.set({ explosions: explosions.filter(exp => !idsToRemove.has(exp.id)) });
  },

  YOU_DIED() {
    store.set({ spectator: true });
  },

  GAME_OVER(data) {
    store.set({ winner: data.winner });
    store.set({players: data.players})
    resetDoms()
    const [, setScreen] = useState("screen");
    setScreen("result");
  },

  RESET_GAME() {
    const [, setScreen] = useState("screen");
    setScreen("game");
  },

  ERROR(data) {
    const [, setError] = useState("error", null);
    setError(data.message);
  },
};

// ─4 ── Actions 
function send(type, data = {}) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

export const joinGame = (nickname)  => send("JOIN",{ nickname });
export const getMap = () => send("MAP_INIT");
export const sendMove = (direction) => send("MOVE",{ direction });
export const sendBomb = () => send("BOMB");
export const sendSwitchToGameMap = () => send("SWITCH_TO_GAME_MAP");
export const sendResetGame = () => send("RESET_GAME");

export function sendChatMessage(message) {
  const [nickname] = useState("nickname");
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "CHAT", message, nickname }));
  }
}
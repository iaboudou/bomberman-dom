import { addPlayer, initLobby, removePlayer, showError } from "./handlers/auth.js";
import { addBomb, explodeBomb, removeExplosions } from "./handlers/bombs.js";
import { endGame, startGame } from "./handlers/gameLife.js";
import { showMessage, updateTimer } from "./handlers/lobby.js";
import { moovePlayer } from "./handlers/mooves.js";

export let ws = null;

export function startWebsocketService() {
  ws = new WebSocket(`ws://localhost:8080`);
  ws.onopen = () => console.log("connected to the ws");
  ws.onerror = (err) => console.error(err);
  ws.onmessage = onMessage;
}

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

const handlers = {
  "JOIN_SUCCESS": initLobby,
  "NICKNAME_ERROR": showError,
  "NEW_PLAYER": addPlayer,
  "PLAYER_LEFT": removePlayer,
  "WAINTING_OR_COUNTDOWN_TIMER": updateTimer,
  "CHAT": showMessage,
  "MAP_INIT": startGame,
  "PLAYER_MOOVED": moovePlayer,
  "BOMB_PLACED": addBomb,
  "BOMB_EXPLODED": explodeBomb,
  "REMOVE_EXPLOSIONS": removeExplosions,
  "GAME_OVER": endGame,
};

export function send(type, data = {}) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

export function sendChatMessage(message) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "CHAT", data: { message } }));
  }
}

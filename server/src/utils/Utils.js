import { Room } from "../states/Room.js";
import { TILES } from "./Const.js";
import WebSocket, { WebSocketServer } from "ws";

export function getPosition(x, y, range) {
  // centre
  if (x === 0 && y === 0) return "center";

  // axe vertical
  if (x === 0) {
    if (y === range) return "down-end";
    if (y === -range) return "up-end";
    return "h-mid";
  }

  // axe horizontal
  if (y === 0) {
    if (x === range) return "right-end";
    if (x === -range) return "left-end";
    return "v-mid";
  }
}

export function sendTofront(socket, type, data = {}) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, data }));
  }
}
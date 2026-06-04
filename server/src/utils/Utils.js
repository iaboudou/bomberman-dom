import { Room } from "../states/Room.js";
import { TILES } from "./Const.js";
import WebSocket, { WebSocketServer } from "ws";

// used to announce new player to the others
export const broadcastNewPlayer = (players, newPlayer) => {
  players.forEach((p) => {
    if (p.nickname === newPlayer) return;
    p.socket.send(
      JSON.stringify({
        type: "NEW_PLAYER",
        data: { nickname: newPlayer },
      }),
    );
  });
};

// used to announce player left to the others
export const broadCastPlayerLeft = (players, playerLeft) => {
  players.forEach((p) => {
    if (p.socket && p.socket.readyState === 1)
      p.socket.send(
        JSON.stringify({
          type: "PLAYER_LEFT",
          data: { left: playerLeft },
        }),
      );
  });
};

// try to moove the player in the given direction, if possible, then announce it to all players
export const MoovePlayer = (direction, player, ROOM) => {
  if (!player.canMove() || player.isDead()) return;

  let nx = player.x;
  let ny = player.y;

  if (direction === "ArrowUp") ny--;
  else if (direction === "ArrowDown") ny++;
  else if (direction === "ArrowLeft") nx--;
  else if (direction === "ArrowRight") nx++;

  const bombOnCell = ROOM.bombs.some((b) => b.x === nx && b.y === ny);

  if (!ROOM.map.isWalkable(ny, nx) || bombOnCell) return;

  player.moove(nx, ny, direction);

  const animationDuration = player.speedCooldown / player.speed;

  const powerup = ROOM.powerups.find((pu) => pu.x === nx && pu.y === ny);

  if (powerup) {
    player.takePowerUp();
    ROOM.powerups = ROOM.powerups.filter((p) => p.id !== powerup.id);
  }

  const isInExplosion = ROOM.explosionCells?.some(
    (e) => e.x === nx && e.y === ny,
  );

  if (isInExplosion) player.loseLife();

  const alivePlayers = ROOM.players.filter((p) => !p.isDead());

  if (alivePlayers.length <= 1) {
    ROOM.players.forEach((p) => {
      sendTofront(p.socket, "GAME_OVER", {
        winner: alivePlayers[0] || null,
      });
    });
  } else {
    ROOM.players.forEach((p) => {
      sendTofront(p.socket, "PLAYER_MOVED", {
        id: player.id,
        x: player.x,
        y: player.y,
        remaininglife: player.remaininglife,
        direction: player.direction,
        duration: animationDuration,
        powerupTaken: powerup,
      });
    });
  }
};

// handle the bomb explosion, update the map and the players accordingly, then announce it to all players
export const triggerExplosion = (bomb, ROOM) => {
  const cellsAffected = bomb.explode(map);
  const removedBlocks = [];
  const spawnedPowerups = [];
  const deadPlayers = [];
  const affectedPlayers = [];
  const explosionCells = [];

  cellsAffected.forEach(({ x, y }) => {
    if (ROOM.map.grid[y][x] === TILES.block) {
      const pu = ROOM.map.removeBlock(y, x);
      removedBlocks.push({ x, y });

      if (pu) {
        ROOM.powerups.push(pu);
        spawnedPowerups.push(pu);
      }
    }

    ROOM.players.forEach((p) => {
      if (p.x === x && p.y === y) {
        p.loseLife();
        if (p.isDead()) deadPlayers.push(p.id);
        else affectedPlayers.push({ id: p.id, remaininglife: p.remaininglife });
      }
    });

    const dx = x - bomb.x;
    const dy = y - bomb.y;
    const pos = getPosition(dx, dy, bomb.range);

    const cell = { id: crypto.randomUUID(), x: x, y: y, position: pos };
    explosionCells.push(cell);
    ROOM.explosionCells.push(cell);
  });

  ROOM.bombs = ROOM.bombs.filter((b) => b.id !== bomb.id);

  const alivePlayers = ROOM.players.filter((p) => !p.isDead());

  if (alivePlayers.length <= 1) {
    ROOM.players.forEach((p) => {
      sendTofront(p.socket, "GAME_OVER", {
        winner: alivePlayers[0] || null,
      });
    });
  } else {
    ROOM.players.forEach((p) => {
      sendTofront(p.socket, "BOMB_EXPLODED", {
        bombId: bomb.id,
        removedBlocks,
        spawnedPowerups,
        deadPlayers,
        affectedPlayers,
        explosionCells,
      });
    });

    const removeTid = setTimeout(() => {
      const idsToRemove = new Set(explosionCells.map((e) => e.id));

      ROOM.explosionCells = ROOM.explosionCells.filter(
        (e) => !idsToRemove.has(e.id),
      );

      everyone.forEach((p) => {
        sendTofront(p.socket, "REMOVE_EXPLOSIONS", { explosionCells });
      });
    }, 500);

    ROOM.pendingTimeouts.push(removeTid);
  }
};

function getPosition(x, y, range) {
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

export function broadcastMessage(nickname, text, players) {
  if (!text || typeof text !== "string") return;

  const TEXT = text.trim();
  if (TEXT.length === 0 || TEXT.length > 100) return;

  const message = {
    id: crypto.randomUUID(),
    message: TEXT,
    nickname,
  };

  players.forEach((p) => {
    sendTofront(p.socket, "CHAT", message);
  });
}

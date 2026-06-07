import { TILES } from "../utils/Const.js";
import { sendTofront, getPosition } from "../utils/Utils.js";

// handle the bomb explosion, update the map and the players accordingly, then announce it to all players
export const triggerExplosion = (bomb, ROOM) => {
  const cellsAffected = bomb.explode(ROOM.map);
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
      if (p.x === x && p.y === y && p.canBeDamaged()) {
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

  if (alivePlayers.length <= 1) ROOM.endGame(alivePlayers[0])
  else {
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

      ROOM.players.forEach((p) => {
        sendTofront(p.socket, "REMOVE_EXPLOSIONS", { explosionCells });
      });
    }, 500);

    ROOM.pendingTimeouts.push(removeTid);
  }
};
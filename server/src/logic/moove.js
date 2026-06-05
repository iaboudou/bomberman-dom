import { sendTofront } from "../utils/Utils.js";

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
    player.takePowerUp(powerup);
    ROOM.powerups = ROOM.powerups.filter((p) => p.id !== powerup.id);
  }

  const isInExplosion = ROOM.explosionCells?.some(
    (e) => e.x === nx && e.y === ny,
  );

  if (isInExplosion && player.canBeDamaged()) player.loseLife();

  const alivePlayers = ROOM.players.filter((p) => !p.isDead());

  if (alivePlayers.length <= 1) ROOM.endGame(alivePlayers[0])
  else {
    ROOM.players.forEach((p) => {
      sendTofront(p.socket, "PLAYER_MOOVED", {
        id: player.id,
        x: player.x,
        y: player.y,
        remaininglife: player.remaininglife,
        direction: player.direction,
        duration: animationDuration,
        takenPowerup: powerup,
      });
    });
  }
};

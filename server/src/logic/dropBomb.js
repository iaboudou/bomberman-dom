import { sendTofront } from "../utils/Utils.js";
import { triggerExplosion } from "./explosion.js";
import { Bomb } from "../entities/Bomb.js";

export function dropBomb(room, player) {
    if (!player.canPlaceBomb() || player.isDead()) return;

    const bombOnCell = room.bombs.some(
        (b) => b.x === player.x && b.y === player.y,
    );

    if (bombOnCell) return;

    const bomb = new Bomb(player.x, player.y, player.range);
    room.bombs.push(bomb);
    player.activeBombs++;

    const tid = setTimeout(() => {
        player.activeBombs--;
        triggerExplosion(bomb, room);
    }, bomb.duration);
    room.pendingTimeouts.push(tid);

    room.players.forEach((p) =>
        sendTofront(p.socket, "BOMB_PLACED", { bomb }),
    );
}
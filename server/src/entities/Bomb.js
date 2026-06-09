import { randomUUID } from "crypto";
import { EXPLOSION_TIMER } from "../utils/Const.js";

export class Bomb {
  constructor(x, y, range = 1) {
    this.id = randomUUID();
    this.x = x;
    this.y = y;
    this.range = range;
    this.duration = EXPLOSION_TIMER;
  }

  explode(map) {
    const cells = [{ x: this.x, y: this.y }];

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    for (const { dx, dy } of directions) {
      for (let i = 1; i <= this.range; i++) {
        const nx = this.x + dx * i;
        const ny = this.y + dy * i;

        if (!map.grid[ny] || map.grid[ny][nx] === undefined) break;

        if (!map.isWalkable(ny, nx)) {
          if (map.grid[ny][nx] === map.TILES.block) {
            cells.push({ x: nx, y: ny });
          }
          break;
        }

        cells.push({ x: nx, y: ny });
      }
    }

    return cells;
  }
}

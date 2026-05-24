import { randomUUID } from "crypto";

export class Bomb {
  constructor(x, y, range = 1) {
    this.id = randomUUID();
    this.x = x;
    this.y = y;
    this.range = range;
    this.duration = 1500;
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

export const dropBomb = () => {
  const [bombs, setBombs] = useState("bombs");
  const [player] = useState("currentPlayer");

  if (!player.canPlaceBomb()) return;

  const newBomb = new Bomb(player.x, player.y, player.range);
  player.activeBombs++;
  setBombs([...bombs, newBomb]);

  setTimeout(() => {
    player.activeBombs--;
    triggerExplosion(newBomb);
    const [currentBombs, setCurrentBombs] = useState("bombs");
    setCurrentBombs(currentBombs.filter((b) => b.id !== newBomb.id));
  }, newBomb.duration);
};

function triggerExplosion(bomb) {
  const [map, setMap] = useState("map");
  const [powerups, setPowerups] = useState("powerups");
  const [players, setPlayers] = useState("players");

  const cellsAffected = bomb.explode(map);

  cellsAffected.forEach(({ x, y }) => {
    if (map.grid[y][x] === map.tiles.block) {
      map.removeBlock(y, x);
      const pu = spawnPowerUp(x, y);
      if (pu) setPowerups([...powerups, pu]);
    }

    players.forEach((p) => {
      if (p.x === x && p.y === y) {
        p.loseLife();
      }
    });
  });

  setPlayers(players.filter((p) => !p.isDead()));
  setMap(map);
}
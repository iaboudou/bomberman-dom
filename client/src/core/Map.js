// export class Map {
//   // initializes the map grid
//   constructor(width, height) {
//     this.width = width;
//     this.height = height;
//     this.grid = [];
//   }

//   // returns a Virtual DOM representation of the map
//   render(el) { }
// }

const COLS = 17;
const ROWS = 13;
const CELL_SIZE = 64; // px

export const CELL = {
  EMPTY: 0,
  WALL: 1, // indestructible
  BLOCK: 2, // destructible
};

export function generateMap() {
  const grid = [];

  for (let row = 0; row < ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < COLS; col++) {
      grid[row][col] = getCell(row, col);
    }
  }

  return grid;
}

function getCell(row, col) {
  if (
    row === 0 ||
    col === 0 ||
    row === ROWS - 1 ||
    col === COLS - 1 ||
    (row % 2 === 0 && col % 2 === 0)
  ) {
    return CELL.WALL;
  }

  // Zones de spawn — coins libres pour les joueurs
  if (isSpawnZone(row, col)) return CELL.EMPTY;

  // Blocs destructibles — aléatoires
  return Math.random() < 0.6 ? CELL.BLOCK : CELL.EMPTY;
}

function isSpawnZone(row, col) {
  return (
    (row === 1 && col === 1) ||
    (row === 1 && col === 2) ||
    (row === 2 && col === 1) ||
    (row === 1 && col === COLS - 2) ||
    (row === 1 && col === COLS - 3) ||
    (row === 2 && col === COLS - 2) ||
    (row === ROWS - 2 && col === 1) ||
    (row === ROWS - 3 && col === 1) ||
    (row === ROWS - 2 && col === 2) ||
    (row === ROWS - 2 && col === COLS - 2) ||
    (row === ROWS - 3 && col === COLS - 2) ||
    (row === ROWS - 2 && col === COLS - 3)
  );
}

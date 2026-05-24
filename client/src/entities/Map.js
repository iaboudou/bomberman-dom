export class GameMap {
  constructor(grid, tiles) {
    this.grid = grid;
    this.tiles = tiles;
    this.classes = {
      [tiles.empty]: "empty",
      [tiles.wall]: "wall",
      [tiles.block]: "block",
    };
  }

  //update the current grid if something changed
  updateCell(row, col, type) {
    this.grid[row][col] = type;
  }

  //check if the block is walkable
  isWalkable(row, col) {
    return this.grid[row][col] === this.tiles.empty;
  }
}

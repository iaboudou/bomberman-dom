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
}

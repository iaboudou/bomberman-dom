export class Bomb {
  // initializes a bomb with its owner and explosion range
  constructor(id, x, y, range) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.range = range;
    this.isExploded = false;
  }
}

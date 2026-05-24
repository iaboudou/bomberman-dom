export class Bomb {
  // initializes a bomb with its owner and explosion range
  constructor(id, x, y, range) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.range = range;
    this.isExploded = false;
  }

  // triggers the explosion
  explode() { }

  // returns a Virtual DOM representation of the bomb or explosion
  render(el) { }
}

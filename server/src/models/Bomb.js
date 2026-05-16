export class Bomb {
  // Initializes a bomb with position, range, and owner
  constructor(x, y, range, playerId) {
    this.x = x;
    this.y = y;
    this.range = range;
    this.playerId = playerId;
  }

  // Starts the explosion countdown
  startTimer(onExplode) { }

  // Calculates the affected tiles based on range and map
  getExplosionArea(map) { }
}

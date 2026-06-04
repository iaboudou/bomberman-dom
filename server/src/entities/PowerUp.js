export class PowerUp {
  constructor(x, y, type) {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    this.type = type;
  }

  apply(player) {
    if (this.type === "range") {
      const MAX_RANGE = 6;
      if (player.range < MAX_RANGE) {
        player.range++;
      }
    }

    if (this.type === "maxBombs") {
      player.maxBombs++;
    }

    if (this.type === "speed") {
      player.speed++;
    }
  }
}
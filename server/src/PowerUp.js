export class PowerUp {
  /* 
    Types: "BOMBS", "FLAMES", "SPEED"
  */
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  // Applies the power-up effect to a player
  apply(player) { }
}

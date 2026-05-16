export class Player {
  // initializes a player with ID, nickname, socket, and starting position
  constructor(id, nickname, socket, x, y) {
    this.id = id;
    this.nickname = nickname;
    this.socket = socket;
    this.x = x;
    this.y = y;
    // initialize stats
    this.lives = 3;
    this.maxBombs = 1;
    this.bombRange = 1;
    this.speed = 1;
  }

  // Updates the player's position
  updatePosition(newX, newY) { }

  // do -1 player's lives, if lives == 0, kill the player
  takeDamage() { }
}

export class Player {
  constructor(nickname, socket, x, y) {
    this.nickname = nickname;
    this.socket = socket;
    this.x = x;
    this.y = y;
    this.lives = 3;
    this.maxBombs = 1;  // number of bombs that can explode continuously
    this.bombRange = 1; //explosion range of the player's bomb
    this.speed = 1;
  }

  // Updates the player's position
  updatePosition(newX, newY) { }

  // do -1 player's lives, if lives == 0, kill the player
  takeDamage() { }
}

export class Player {
  constructor(nickname, socket, x, y) {
    this.id = crypto.randomUUID();
    this.socket = socket;
    this.nickname = nickname;
    this.x = x;
    this.y = y;
    this.direction = "down";
    this.maxBombs = 1;
    this.activeBombs = 0;
    this.range = 2;
    this.maxlife = 3;
    this.remaininglife = 3;
    this.speed = 1;
    this._lastMove = 0;
  }

  moove(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  canMove() {
    const cooldown = 200 / this.speed; // speed 1 = 200ms, speed 2 = 100ms
    return Date.now() - this._lastMove >= cooldown;
  }

  registerMove() {
    this._lastMove = Date.now();
  }

  canPlaceBomb() {
    return this.activeBombs < this.maxBombs;
  }

  loseLife() {
    this.remaininglife--;
  }

  isDead() {
    return this.remaininglife <= 0;
  }

}

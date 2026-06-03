export class Player {
  constructor(nickname, socket, x, y, number) {
    this.id = crypto.randomUUID();
    this.socket = socket;
    this.nickname = nickname;
    this.x = x;
    this.y = y;
    this.number = number
    this.maxlife = 3;
    this.remaininglife = 3;
    this.maxBombs = 1;
    this.activeBombs = 0;
    this.range = 2;
    this.speed = 1;
    this.direction = "down";
    this._lastMove = 0;
    this.speedCooldown = 400 //ms
  }

  moove(x, y, direction) {
    if (x !== this.x || y !== this.y) this._lastMove = Date.now();
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  canMove() {
    const cooldown = this.speedCooldown / this.speed; // speed 1 = 400ms, speed 2 = 200ms
    return Date.now() - this._lastMove >= cooldown;
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

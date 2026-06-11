import {
  DEFAULT_SPEED_COOLDOWN,
  LOSING_LIFE_ANIMATION_DURATION,
  MAX_BOMBS,
  MAX_RANGE,
  MAX_SPEED,
} from "../utils/Const.js";

export class Player {
  constructor(nickname, socket, x, y, number) {
    this.id = crypto.randomUUID();
    this.socket = socket;
    this.nickname = nickname;
    this.x = x;
    this.y = y;
    this.number = number;
    this.maxlife = 3;
    this.remaininglife = 3;
    this.maxBombs = 1;
    this.activeBombs = 0;
    this.range = 2;
    this.speed = 1;
    this.direction = "down";
    this._lastMove = 0;
    this.speedCooldown = DEFAULT_SPEED_COOLDOWN;
    this.lastTimeDamaged = 0;
  }

  moove(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this._lastMove = Date.now();
  }

  canMove() {
    const cooldown = this.speedCooldown / this.speed; // speed 1 = 400ms, speed 2 = 200ms
    return Date.now() - this._lastMove >= cooldown && !this.isImmortal();
  }

  canPlaceBomb() {
    return this.activeBombs < this.maxBombs;
  }

  isImmortal() {
    return Date.now() - this.lastTimeDamaged < LOSING_LIFE_ANIMATION_DURATION;
  }

  loseLife() {
    this.remaininglife--;
    this.lastTimeDamaged = Date.now();
  }

  isDead() {
    return this.remaininglife <= 0;
  }

  takePowerUp(pu) {
    if (pu.type === "range" && this.range < MAX_RANGE) this.range++;
    else if (pu.type === "maxBombs" && this.maxBombs < MAX_BOMBS)this.maxBombs++;
    else if (pu.type === "speed" && this.speed < MAX_SPEED) this.speed += 0.5;
  }
}

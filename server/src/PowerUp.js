export class PowerUp {
  constructor(x, y, type) {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    this.type = type;
    this.icones = {
      range: "🔥",
      maxBombs: "🧨",
      speed: "👟",
    };
  }

  apply(player) {
    if (this.type === "range") {
      player.range++;
    }

    if (this.type === "maxBombs") {
      player.maxBombs++;
    }

    if (this.type === "speed") {
      player.speed++;
    }
  }
}

const POWERUP_TYPES = ["range", "maxBombs", "speed"];
const POWERUP_CHANCE = 0.3;

export function spawnPowerUp(x, y, probability = POWERUP_CHANCE) {
  if (Math.random() > probability) return null;
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  return new PowerUp(x, y, type);
}

export function collectPowerUp(player, powerups) {
  const collected = powerups.find(
    (p) => p.x === player.x && p.y === player.y
  );
  if (!collected) {
    return powerups;
  }
  collected.apply(player);
  return powerups.filter((p) => p.id !== collected.id);
}
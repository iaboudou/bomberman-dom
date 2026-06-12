// for easier readability, we left number but we could totaly use tiles methods
export const DEFAULT_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const TILES = {
  empty: 0,
  wall: 1,
  block: 2,
};

export const DEFAULT_DENSITY = 0.8;

export const spawnPoints = [
  { x: 1, y: 1 },
  { x: DEFAULT_GRID[0].length - 2, y: DEFAULT_GRID.length - 2 },
  { x: DEFAULT_GRID[0].length - 2, y: 1 },
  { x: 1, y: DEFAULT_GRID.length - 2 },
];

export const MAX_RANGE = 4;
export const MAX_BOMBS = 3;
export const MAX_SPEED = 2;
export const MAX_LIFE = 3;

export const DEFAULT_SPEED_COOLDOWN = 400; //ms

export const LOSING_LIFE_ANIMATION_DURATION = 1.5; //secondes
export const DYING_ANIMATION_DURATION = 1.5; //secondes

export const POWERUP_TYPES = ["range", "maxBombs", "speed"];
export const POWERUP_CHANCE = 0.3;

export const EXPLOSION_TIMER = 2400; //ms

export const DEFAULT_WAITING_TIME = 20; // secondes
export const DEFAULT_COUNTDOWN_TIME = 10; //seondes

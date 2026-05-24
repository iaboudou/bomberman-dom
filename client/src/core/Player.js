export class Player {
  // Creates a new player with coordinates and nickname
  constructor(nickname, x, y) {
    // initialize player name
    this.nickname = nickname;
    // set initial grid position (x, y)
    this.x = x;
    this.y = y;
    // initialize stats
    this.lives = 3;
    this.speed = 1;
  }

  // changes player position
  move(direction) { }

  // returns a Virtual DOM representation of the player
  render(el) { }
}

import { GameMap } from "../entities/Map.js";
import { Player } from "../entities/Player.js";
import { spawnPoints } from "../utils/Const.js";
import { sendTofront } from "../utils/Utils.js";

export class Room {
  constructor(id) {
    this.id = id;
    this.map = null;
    this.clients = [];
    this.players = [];
    this.bombs = []; // bombs currently placed on the map by the players
    this.powerups = [];
    this.status = "WAITING"; // WAITING - COUNTDOWN - INGAME - FINISHED
    this.countdown = 0; // 10 seconds remaining in the countdown before the game starts
    this.waitingTime = 0; // time waiting for more players to join
    this.setInterval_waitingTimer = null;
    this.setInterval_countdownTimer = null;
    this.explosionCells = [];
    this.pendingTimeouts = [];
  }

  //add someone in the room
  addClient(nickname, ws) {
    if (this.isFull()) return "Room if full, please try later.";
    if (!this.nicknameIsValid(nickname)) return "Invalid nickname";
    if (this.hasNickname(nickname)) return "The nickname is already used";
    if (this.status === "COUNTDOWN")
      return "The game is almost starting, please come back later";
    if (this.status === "INGAME")
      return "The battle is already going , please come back later";

    this.clients.push({ nickname: nickname, socket: ws });

    if (this.clients.length === 2 && this.status === "WAITING") {
      this.startWaitingTimer();
    } else if (this.clients.length === 4) {
      if (this.setInterval_waitingTimer) {
        clearInterval(this.setInterval_waitingTimer);
        this.setInterval_waitingTimer = null;
        this.waitingTime = 0;
      }

      this.startCountdown();
    }

    return "success";
  }

  // check if the room has reached 4 players
  isFull() {
    return this.players.length + this.clients.length >= 4;
  }

  hasNickname(nickname) {
    return [...this.players, ...this.clients].some(
      (p) => p.nickname.toLowerCase() === nickname.toLowerCase(),
    );
  }

  nicknameIsValid(nickname) {
    if (/^[a-zA-Z0-9]+$/.test(nickname) && nickname.length <= 10) {
      return true;
    }
  }

  // start 20s waiting timing if more than 2 players
  // if a player leaves and the count drops below 2, the timer is stopped
  // if 20s passed without hitting 4 player start 10s countdown
  startWaitingTimer() {
    if (this.setInterval_waitingTimer) return;

    this.waitingTime = 10;
    this.status = "WAITING";

    this.clients.forEach((c) =>
      sendTofront(c.socket, "WAINTING_OR_COUNTDOWN_TIMER", {
        waitingTime: this.waitingTime,
        type: "waitingTime",
      }),
    );

    this.setInterval_waitingTimer = setInterval(() => {
      if (this.clients.length < 2) {
        clearInterval(this.setInterval_waitingTimer);
        this.setInterval_waitingTimer = null;
        this.waitingTime = 0;
        return;
      }

      if (this.waitingTime <= 1) {
        clearInterval(this.setInterval_waitingTimer);
        this.setInterval_waitingTimer = null;
        this.waitingTime = 0;
        this.startCountdown();
      } else {
        this.waitingTime--;
        this.clients.forEach((c) =>
          sendTofront(c.socket, "WAINTING_OR_COUNTDOWN_TIMER", {
            waitingTime: this.waitingTime,
            type: "waitingTime",
          }),
        );
      }
    }, 1000);
  }

  // start 10s countdown
  startCountdown() {
    if (this.setInterval_countdownTimer) return;

    this.initGameState();
    this.status = "COUNTDOWN";
    this.countdown = 5;

    this.players.forEach((c) =>
      sendTofront(c.socket, "WAINTING_OR_COUNTDOWN_TIMER", {
        waitingTime: this.countdown,
        type: "countdown",
      }),
    );

    this.setInterval_countdownTimer = setInterval(() => {
      if (this.players.length < 2) {
        clearInterval(this.setInterval_countdownTimer);
        this.setInterval_countdownTimer = null;
        this.status = "WAITING";
        this.countdown = 0;
        this.clients = this.players.map((p) => {
          return { nickname: p.nickname, socket: p.socket };
        });
        this.players = [];
        this.clients.forEach((c) =>
          sendTofront(c.socket, "WAINTING_OR_COUNTDOWN_TIMER", {
            waitingTime: this.countdown,
            type: "countdown",
          }),
        );
        return;
      }

      if (this.countdown <= 1) {
        clearInterval(this.setInterval_countdownTimer);
        this.setInterval_countdownTimer = null;
        this.countdown = 0;
        this.status = "INGAME";
        this.startGame();
      } else {
        this.countdown--;
        this.players.forEach((c) =>
          sendTofront(c.socket, "WAINTING_OR_COUNTDOWN_TIMER", {
            waitingTime: this.countdown,
            type: "countdown",
          }),
        );
      }
    }, 1000);
  }

  initGameState() {
    const newPlayers = this.clients.map((c, i) => {
      const spawn = spawnPoints[i];
      return new Player(c.nickname, c.socket, spawn.x, spawn.y, i);
    });

    this.clients = [];
    this.players = newPlayers;
    this.map = new GameMap();
  }

  startGame() {
    this.players.forEach((p, i) => {
      sendTofront(p.socket, "MAP_INIT", {
        grid: this.map.grid,
        tiles: this.map.TILES,
        classes: this.map.classes,
        players: this.players.map((player) => ({
          id: player.id,
          number: player.number,
          nickname: player.nickname,
          x: player.x,
          y: player.y,
          direction: player.direction,
          remaininglife: player.remaininglife,
          maxlife: player.maxlife,
        })),
      });
    });
  }

  // remove the player from the room in case of disconnect
  removeClient(nickname) {
    this.players = this.players.filter((p) => p.nickname !== nickname);
    this.clients = this.clients.filter((p) => p.nickname !== nickname);
  }
}

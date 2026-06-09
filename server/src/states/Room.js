import { GameMap } from "../entities/Map.js";
import { Player } from "../entities/Player.js";
import {
  DEFAULT_COUNTDOWN_TIME,
  DEFAULT_WAITING_TIME,
  DYING_ANIMATION_DURATION,
  LOSING_LIFE_ANIMATION_DURATION,
  spawnPoints,
} from "../utils/Const.js";
import { sendTofront } from "../utils/Utils.js";

export class Room {
  constructor(id) {
    this.id = id;
    this.map = null;
    this.clients = [];
    this.players = [];
    this.bombs = []; // bombs currently placed on the map by the players
    this.powerups = [];
    this.status = "WAITING"; // WAITING - COUNTDOWN - INGAME
    this.countdown = 0; // 10 seconds remaining in the countdown before the game starts
    this.waitingTime = 0; // time waiting for more players to join
    this.setInterval_waitingTimer = null;
    this.setInterval_countdownTimer = null;
    this.explosionCells = [];
    this.pendingTimeouts = [];
  }

  endGame(winner) {
    this.players.forEach((p) => {
      sendTofront(p.socket, "GAME_OVER", {
        winner,
      });
    });

    this.reset();
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
      this.removeWaitingTimer();
      // this.startCountdown();
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

  sendTimer(type) {
    const receivers = this.clients.length > 0 ? this.clients : this.players;

    receivers.forEach((c) =>
      sendTofront(c.socket, "WAINTING_OR_COUNTDOWN_TIMER", {
        waitingTime: this[type],
        type,
      }),
    );
  }

  // start 20s waiting timing if more than 2 players
  // if 20s passed without hitting 4 player start 10s countdown
  startWaitingTimer() {
    if (this.setInterval_waitingTimer) return;

    this.waitingTime = DEFAULT_WAITING_TIME;
    this.status = "WAITING";

    this.sendTimer("waitingTime");

    this.setInterval_waitingTimer = setInterval(() => {
      if (this.waitingTime <= 1) {
        this.removeWaitingTimer();
        this.startCountdown();
      } else {
        this.waitingTime--;
        this.sendTimer("waitingTime");
      }
    }, 1000);
  }

  removeWaitingTimer() {
    if (this.setInterval_waitingTimer) {
      clearInterval(this.setInterval_waitingTimer);
      this.setInterval_waitingTimer = null;
      this.waitingTime = 0;
    }
  }

  removeCountDown(rollback = false) {
    if (this.setInterval_countdownTimer) {
      clearInterval(this.setInterval_countdownTimer);
      this.setInterval_countdownTimer = null;
      this.countdown = 0;
    }
  }

  // start 10s countdown
  startCountdown() {
    if (this.setInterval_countdownTimer) return;

    this.initGameState();
    this.status = "COUNTDOWN";
    this.countdown = DEFAULT_COUNTDOWN_TIME;

    this.sendTimer("countdown");

    this.setInterval_countdownTimer = setInterval(() => {
      if (this.countdown <= 1) {
        this.removeCountDown();
        this.startGame();
      } else {
        this.countdown--;
        this.sendTimer("countdown");
      }
    }, 1000);
  }

  initGameState() {
    const newPlayers = this.clients.map((c, i) => {
      const spawn = spawnPoints[i];
      return new Player(c.nickname, c.socket, spawn.x, spawn.y, i + 1);
    });

    this.clients = [];
    this.players = newPlayers;
    this.map = new GameMap();
  }

  startGame() {
    this.status = "INGAME";

    this.players.forEach((p, i) => {
      sendTofront(p.socket, "MAP_INIT", {
        grid: this.map.grid,
        tiles: this.map.TILES,
        classes: this.map.classes,
        losingLifeAnimationDuration: LOSING_LIFE_ANIMATION_DURATION,
        dyingAnimationDuration: DYING_ANIMATION_DURATION,
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

  reset() {
    this.map = null;
    this.clients = [];
    this.players = [];
    this.bombs = [];
    this.powerups = [];
    this.status = "WAITING";
    this.countdown = 0;
    this.waitingTime = 0;
    this.setInterval_waitingTimer = null;
    this.setInterval_countdownTimer = null;
    this.explosionCells = [];
    this.pendingTimeouts.forEach((id) => clearTimeout(id));
    this.pendingTimeouts = [];
  }

  // remove the player from the room in case of disconnect
  removeClient(nickname) {
    this.players = this.players.filter((p) => p.nickname !== nickname);
    this.clients = this.clients.filter((p) => p.nickname !== nickname);

    if (this.clients.length === 0 && this.players.length === 0) {
      this.reset();
      return;
    }

    const receivers = this.clients.length > 0 ? this.clients : this.players;
    receivers.forEach((r) =>
      sendTofront(r.socket, "PLAYER_LEFT", { left: nickname }),
    );
    switch (this.status) {
      case "WAITING": {
        if (this.clients.length < 2) {
          this.removeWaitingTimer();
          this.sendTimer("waitingTime");
        }
        break;
      }
      case "COUNTDOWN": {
        if (this.players.length < 2) {
          this.removeCountDown();
          this.players.forEach((p) =>
            this.clients.push({ nickname: p.nickname, socket: p.socket }),
          );
          this.players = [];
          this.status = "WAITING";
          this.sendTimer("waitingTime");
        }
        break;
      }
      case "INGAME": {
        const alivePlayers = this.players.filter((p) => !p.isDead());
        if (alivePlayers.length < 2) {
          this.endGame(alivePlayers[0] || null);
        }
        break;
      }
    }
  }
}

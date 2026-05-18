import { GameMap } from "./Map.js";
import { GameHandler } from "./GameHandler.js";

export class Room {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.map = new GameMap();
    this.bombs = [];
    this.powerups = [];
    this.messages = [];

    // WAITING - COUNTDOWN - INGAME - FINISHED
    this.status = "WAITING";

    this.countdown = 0;
    this.waitingTime = 0;
    this.waitingTimer = null;
    this.countdownTimer = null;
    this.createdAt = Date.now();
  }

  // add new player to the room
  addPlayer(player) {
    if (this.isFull()) return false;
    this.players.push(player);

    if
      (this.players.length === 2 && this.status === "WAITING") {
      this.startWaitingTimer();
    }
    else if
      (this.players.length === 4) {
      // if it hit 4 players, clear the timer and start countdown
      if (this.waitingTimer) {
        clearInterval(this.waitingTimer);
        this.waitingTimer = null;
        this.waitingTime = 0;
      }
      this.startCountdown();
    }
    return true;
  }

  // remove the player from the room in case of disconnect
  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);

    if (this.players.length < 2) {
      if (this.waitingTimer) {
        clearInterval(this.waitingTimer);
        this.waitingTimer = null;
      }
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      this.status = "WAITING";
      this.countdown = 0;
      this.waitingTime = 0;
    }

    // reset when the room is empty
    if (this.players.length === 0) {
      this.bombs = [];
      this.powerups = [];
      this.map = new GameMap();
    }
  }

  // check if the room has reached 4 players
  isFull() {
    return this.players.length >= 4;
  }

  // start 20s waiting timing if more than 2 players 
  startWaitingTimer() {
    if (this.waitingTimer) return;

    this.waitingTime = 20;
    this.status = "WAITING";

    gameHandler.broadcastState();

    this.waitingTimer = setInterval(() => {
      if (this.players.length < 2) {
        clearInterval(this.waitingTimer);
        this.waitingTimer = null;
        this.waitingTime = 0;
        return;
      }

      if (this.waitingTime <= 1) {
        clearInterval(this.waitingTimer);
        this.waitingTimer = null;
        this.waitingTime = 0;
        // if 20s passed without hitting 4 player start 10s countdown
        this.startCountdown();
      } else {
        this.waitingTime--;
        gameHandler.broadcastState();
      }
    }, 1000);
  }

  // start 10s countdown
  startCountdown() {
    if (this.countdownTimer) return;

    // Clear 20s waiting timer if active
    if (this.waitingTimer) {
      clearInterval(this.waitingTimer);
      this.waitingTimer = null;
      this.waitingTime = 0;
    }

    this.status = "COUNTDOWN";
    this.countdown = 10;

    gameHandler.broadcastState();

    this.countdownTimer = setInterval(() => {
      if (this.players.length < 2) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.status = "WAITING";
        this.countdown = 0;
        gameHandler.broadcastState();
        return;
      }

      if (this.countdown <= 1) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.countdown = 0;
        this.status = "INGAME";
        gameHandler.startGame();
      } else {
        this.countdown--;
        gameHandler.broadcastState();
      }
    }, 1000);
  }
}

export const mainRoom = new Room("global-1");
export const gameHandler = new GameHandler(mainRoom);

export function startroomgame() {
  return { mainRoom, gameHandler };
}
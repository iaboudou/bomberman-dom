import { GameMap } from "./Map.js";
import { GameHandler } from "./GameHandler.js";
import { ChatHandler } from "./ChatHandler.js";

export class Room {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.map = new GameMap();
    this.bombs = []; // bombs currently placed on the map by the players
    this.powerups = [];
    this.messages = [];
    this.status = "WAITING"; // WAITING - COUNTDOWN - INGAME - FINISHED
    this.countdown = 0; // 10 seconds remaining in the countdown before the game starts
    this.waitingTime = 0; // time waiting for more players to join
    this.setInterval_waitingTimer = null;
    this.setInterval_countdownTimer = null;
    this.createdAt = Date.now();
    this.chatHandler = new ChatHandler(this);
    this.spectators = [];
  }

  // add new player to the room
  // if it hit 4 players, clear the timer and start countdown
  addPlayer(player) {
    if (this.isFull()) return false;
    this.players.push(player);

    if
      (this.players.length === 2 && this.status === "WAITING") {
      this.startWaitingTimer();
    }
    else if
      (this.players.length === 4) {
      if (this.setInterval_waitingTimer) {
        clearInterval(this.setInterval_waitingTimer);
        this.setInterval_waitingTimer = null;
        this.waitingTime = 0;
      }
      this.startCountdown();
    }
    return true;
  }

  // remove the player from the room in case of disconnect
  removePlayer(playerName) {
    this.players = this.players.filter(p => p.nickname !== playerName);

    if (this.players.length < 2) {
      if (this.setInterval_waitingTimer) {
        clearInterval(this.setInterval_waitingTimer);
        this.setInterval_waitingTimer = null;
      }
      if (this.setInterval_countdownTimer) {
        clearInterval(this.setInterval_countdownTimer);
        this.setInterval_countdownTimer = null;
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
  // if a player leaves and the count drops below 2, the timer is stopped
  // if 20s passed without hitting 4 player start 10s countdown
  startWaitingTimer() {
    if (this.setInterval_waitingTimer) return;

    this.waitingTime = 20;
    this.status = "WAITING";

    gameHandler.broadcastState(this.waitingTime, "waitingTime");

    this.setInterval_waitingTimer = setInterval(() => {
      if (this.players.length < 2) {
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
        gameHandler.broadcastState(this.waitingTime, "waitingTime");
      }
    }, 1000);
  }

  // start 10s countdown
  startCountdown() {
    if (this.setInterval_countdownTimer) return;

    this.status = "COUNTDOWN";
    this.countdown = 10;

    gameHandler.broadcastState(this.countdown, "countdown");

    this.setInterval_countdownTimer = setInterval(() => {
      if (this.players.length < 2) {
        clearInterval(this.setInterval_countdownTimer);
        this.setInterval_countdownTimer = null;
        this.status = "WAITING";
        this.countdown = 0;
        gameHandler.broadcastState(this.countdown), "countdown";
        return;
      }

      if (this.countdown <= 1) {
        clearInterval(this.setInterval_countdownTimer);
        this.setInterval_countdownTimer = null;
        this.countdown = 0;
        this.status = "INGAME";
        gameHandler.startGame();
      } else {
        this.countdown--;
        gameHandler.broadcastState(this.countdown, "countdown");
      }
    }, 1000);
  }
}

export const ROOM = new Room("global-1");
export const gameHandler = new GameHandler(ROOM);

export function startroomgame() {
  return { ROOM, gameHandler };
}
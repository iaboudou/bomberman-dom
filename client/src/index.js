import { app, router, event } from "../framework/index.js";
import { Game } from "./core/Game.js";
import { WebsocketService } from "./services/WebsocketService.js";

// initialize Core Services
const socket = new WebsocketService("ws://localhost:8080");
socket.connect();

// setup Game Instance (Using the framework's dom instance)
const game = new Game(app.dom, socket);
game.init();

// register routes using the framework's router
router.register("#", () => console.log("Rendering WelcomeView..."));
router.register("#/lobby", () => console.log("Rendering WaitingView..."));
router.register("#/game", () => {
  game.start();
});
router.register("#/result", () => console.log("Rendering ResultView..."));

// handle global interactions using the framework's event system
event.on(window, "keydown", (e) => game.handleInput(e));

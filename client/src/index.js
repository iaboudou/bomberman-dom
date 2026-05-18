import { Dom, events, store, router, El, useState } from "../mini-framework/index.js"
import { startGame } from "./views/game.js";
import { LobbyView } from "./views/lobby.js";
import { ResultView } from "./views/result.js";
import { WelcomeView } from "./views/welcome.js";
import { startWebsocketService } from "./services/ws.js"

export const gridDOM = new Dom(document.getElementById("grid"), events);
export const playersDOM = new Dom(document.getElementById("players"), events);
export const bombsDOM = new Dom(document.getElementById("bombs"), events);
export const uiDOM = new Dom(document.getElementById("ui"), events);
export { Dom, El, store, events, router, useState };

router.register("#", () => {
  startGame();
  return El("fragment", null);
});
router.init();

function app() {
  startWebsocketService()
}

app()
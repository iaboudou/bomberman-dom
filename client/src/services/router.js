import { LobbyView } from "../views/lobby.js";
import { ResultView } from "../views/result.js";
import { WelcomeView } from "../views/welcome.js";
import { GameView } from "../views/game.js";
import { router, useState } from "../../mini-framework/index.js";

export function initRouter() {
  router.register("#", () => {
    const [screen] = useState("screen", "welcome");
    switch (screen) {
      case "welcome":
        return WelcomeView();
      case "lobby":
        return LobbyView();
      case "game":
        return GameView();
      case "result":
        return ResultView();
      default:
        return WelcomeView();
    }
  });
  router.init();
}

import { router, useState } from "../mini-framework/index.js"
import { startGame } from "./views/game.js";
import { startWebsocketService } from "./services/ws.js"
import { initRouter } from "./services/router.js";



function app() {
  
  startWebsocketService()
  initRouter();
}

app()
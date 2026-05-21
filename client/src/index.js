import { startWebsocketService } from "./services/ws.js"
import { initRouter } from "./services/router.js";

function app() {
  startWebsocketService()
  initRouter();
}

app()
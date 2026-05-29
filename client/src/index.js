import { startWebsocketService } from "./services/ws.js"
import { initRouter } from "./services/router.js";

function app() {
  initRouter();
  startWebsocketService();
  function loop() {
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

app();
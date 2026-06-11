import { startWebsocketService } from "./services/ws.js";
import { initRouter } from "./services/router.js";
import { getEl } from "../mini-framework/index.js";

function app() {
  initRouter();
  startWebsocketService();
}
app();
import { startWebsocketService } from "./services/ws.js";
import { initRouter } from "./services/router.js";
import { getEl } from "../mini-framework/index.js";

function app() {
  initRouter();
  startWebsocketService();
}
app();

let t = 0;
let RAF = null;

const animation = () => {
  const logo = getEl("#logo");

  if (!logo) {
    RAF = requestAnimationFrame(animation);
    return;
  }

  logo.style.transform = `translateX(-50%) translateY(${Math.sin(t) * -8}px)`;
  t += 0.03;

  RAF = requestAnimationFrame(animation);
};

requestAnimationFrame(animation);
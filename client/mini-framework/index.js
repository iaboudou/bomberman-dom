import { Dom } from "./dom.js";
import { Events } from "./events.js";
import { Store } from "./store.js";
import { Router } from "./router.js";

const events = new Events();
const store = new Store();
const bodyDOM = new Dom(document.body, events);
const router = new Router(bodyDOM, store);
const El = bodyDOM.el.bind(bodyDOM);
const getEl = (selector) => bodyDOM.query(selector) 

export { Dom, events, store, router, El, getEl, bodyDOM };

export const useState = (key, initialValue = null) => {
  if (store.get(key) === undefined) {
    store.set({ [key]: initialValue });
    store.subscribe(key, () => router.render());
  }
  const value = store.get(key);
  const setter = (newValue) => store.set({ [key]: newValue });
  return [value, setter];
};

router.register("#/notfound", () => El("div", null, "404 Page not found"));
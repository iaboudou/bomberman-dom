import { Dom } from "./dom.js";
import { Events } from "./events.js";
import { Store } from "./store.js";
import { Router } from "./router.js";

const events = new Events();
const store = new Store();
const dom = new Dom(document.body, events);
const router = new Router(dom, store);
const El = dom.el.bind(dom);
const getEl = (selector) => dom.query(selector) 

export { Dom, events, store, router, El, getEl };

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
import { Dom } from "./dom.js";
import { Events } from "./events.js";
import { Router } from "./router.js";
import { Store } from "./store.js";

class MiniFramework {
  // initializes the MiniFramework class by creating instances of the Dom, Events, Router, and Store classes.
  constructor(container, initialState = {}) {
    this.events = new Events();
    this.dom = new Dom(container, this.events);
    this.store = new Store(initialState);
    this.router = new Router(this.dom, this.store);
  }
}

const app = new MiniFramework(document.body, {});
let El = app.dom.el.bind(app.dom);
const router = app.router;
const state = app.store;
const event = app.events;

export const useState = (key, initialValue = null) => {
  if (state.get(key) === undefined) {
    state.set({ [key]: initialValue });
    state.subscribe(key, () => router.render());
  }

  const value = state.get(key);
  const setter = (newValue) => {
    state.set({ [key]: newValue });
  };

  return [value, setter];
};

export { El, router, state };

router.init();

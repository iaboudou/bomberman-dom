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

router.init();

state.subscribeKey("todos", () => router.render());
state.subscribeKey("input", () => router.render());
state.subscribeKey("editing", () => router.render());

export const useState = (key, initialValue = null) => {
  if (app.store.get(key) === undefined) {
    app.store.set({ [key]: initialValue });
  }

  const value = app.store.get(key);
  const setter = (newValue) => {
    app.store.set({ [key]: newValue });
  };

  return [value, setter];
};

export { El, router };

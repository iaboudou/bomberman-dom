import { Dom } from "./dom.js";
import { Events } from "./events.js";
import { Store } from "./store.js";
import { Router } from "./router.js";

const events = new Events();
const store  = new Store();
const dom    = new Dom(document.body, events);
const router = new Router(dom, store);
const El     = dom.el.bind(dom);

export { Dom, events, store, router, El };

export const useState = (key, initialValue = null, onUpdate = null) => {
  if (store.get(key) === undefined) {
    if (onUpdate) store.subscribe(key, onUpdate);
    store.set({ [key]: initialValue });
  }
  const value = store.get(key);
  const setter = (newValue) => {
    const resolvedValue = typeof newValue === "function" 
        ? newValue(store.get(key)) 
        : newValue;

    store.set({ [key]: resolvedValue })
  };

  return [value, setter];
}
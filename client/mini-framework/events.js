export class Events {
  // Stores event listeners per DOM element using a WeakMap:
  // will have the following structure example :
  /* events = WeakMap {
      "input": {
        callbacks: [fn1, fn2],
        nativeHandler: function(...)
      },
      "click": {
        callbacks: [fn3, fn4],
        nativeHandler: function(...)
      }
  }*/
  constructor() {
    this.events = new WeakMap();
  }

  // Register a callback for a given event on an element
  on(el, event, cb) {
    if (!this.events.has(el)) {
      this.events.set(el, {});
    }

    const elEvents = this.events.get(el);

    if (!elEvents[event]) {
      const nativeHandler = (data) => {
        elEvents[event].callbacks.forEach((c) => c(data));
      };
      elEvents[event] = {
        callbacks: [],
        nativeHandler,
      };
      el.addEventListener(event, nativeHandler);
    }

    elEvents[event].callbacks.push(cb);
  }

  // Remove a specific callback from an event on an element
  // if no longer handler in the event, remove the event listener
  off(el, event, cb) {
    if (!this.events.has(el)) return;

    const elEvents = this.events.get(el);
    if (!elEvents[event]) return;

    elEvents[event].callbacks = elEvents[event].callbacks.filter(
      (c) => c !== cb
    );

    if (elEvents[event].callbacks.length === 0) {
      el.removeEventListener(event, elEvents[event].nativeHandler);
      delete elEvents[event];
    }

    if (Object.keys(elEvents).length === 0) {
      this.events.delete(el);
    }
  }
}

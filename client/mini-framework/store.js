export class Store {
  // initializes the Store class with an optional initial state and an empty array
  // and listeners array to keep track of functions that will be called whenever the state changes.
  constructor(initialState = {}) {
    // state will have the following structure example  :
    /*{
       "todos": [
          { key: "1234", text: "hello world", done: true },
          { key: "5678", text: "hello morocco", done: false }
        ],
      "input": "something",
      "filter": "#/active",
      "editing": null 
    }*/

    //
    // {
    //   todos : () => [router.render()],
    //   editing : () => [router.render()],
    // }
    this.state = initialState;
    this.listeners = {};
  }

  // return the current state of the store.
  get(keys) {
    const arr = keys.split(".");
    let current = this.state;

    for (const key of arr) {
      if (current == null || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  // allows you to update the state of the store by merging the new state with the existing state and then notifying all registered listeners (this.listeners) about the change.
  set(newState) {
    const prevState = this.state;
    this.state = { ...this.state, ...newState };

    // Notify key listeners only for keys that changed
    this.notify(newState, prevState);
  }

  // subscribe to a specific key — callback is called only when that key changes
  // ex: store.subscribeKey("players", (players) => { playersDOM.scheduleMount(renderPlayers(players)) });
  subscribe(key, cb) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(cb);
  }

  // call all registered listener functions and passes them the current state,
  // so they can react to state changes (e.g. update UI, log data, etc.)
  notify(state, prevState) {
    for (const key in state) {
      if (state[key] !== prevState[key] && this.listeners[key]) {
        this.listeners[key].forEach((cb) => cb(this.state[key]));
      }
    }
  }
}

export class Stateful {
  #state = {};

  constructor() {
    this.#state = this.initialState();
  }

  initialState() {
    return {};
  }

  get state() {
    // const updateCallback = this.onStateUpdate;
    // const parentThis = this;
    const updateCallback = (...args) => this.onStateUpdate?.(this, ...args);

    return new Proxy(this.#state, {
      get(target, prop) {
        return target[prop];
      },
      set(target, prop, value) {
        if (!target.hasOwnProperty(prop)) {
          throw new Error(`Unable to create new state property '${prop}'.`);
        }
        target[prop] = value;
        updateCallback(prop);
        return true;
      },
    });
  }

  set state(value) {
    throw new Error(
      "Can't set attribute 'state'. You can not update the state directly."
    );
  }
}
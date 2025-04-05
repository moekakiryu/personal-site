export class Stateful {
  #state = {};

  constructor() {
    this.#state = this.initialState();
  }

  initialState() {
    return {};
  }

  bindEvents(element, eventMapping) {
    Object.entries(eventMapping).forEach(([eventType, handler]) => {
      element.addEventListener(eventType, handler.bind(this))
    })
  }

  get state() {
    // const updateCallback = this.onStateUpdate;
    // const parentThis = this;
    const updateCallback = (...args) => this.onStateUpdate?.(...args);
    const renderCallback = (...args) => this.render?.(...args);

    return new Proxy(this.#state, {
      get(target, prop) {
        return target[prop];
      },
      set(target, prop, value) {
        if (!target.hasOwnProperty(prop)) {
          throw new Error(`Unable to create new state property '${prop}'.`);
        }
        target[prop] = value;

        const updatedState = updateCallback(target, prop, value)

        if (updatedState) {
          Object.keys(updatedState).forEach((prop) => {
            if (!target.hasOwnProperty(prop)) {
              throw new Error(`Unable to create new state property '${prop}'.`);
            }
            target[prop] = updatedState[prop]
          })
        }

        renderCallback(target)
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
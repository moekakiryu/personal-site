export class BaseComponent {
  static name;

  #state = {};
  #element = null;
  #name = null;

  constructor(name, element) {
    this.#name = name;
    this.#element = element;
    this.#state = this.initialState();
  }

  initialState() {
    return {};
  }

  getElement(elementName, { parent } = {}) {
    const selector = `[data-element="${this.name}.${elementName}"]`;

    if (parent) {
      return parent.querySelector(selector);
    }

    return this.#element.querySelector(selector);
  }

  getElements(elementName, { parent } = {}) {
    const selector = `[data-element="${this.name}.${elementName}"]`;

    if (parent) {
      return parent.querySelectorAll(selector);
    }

    return this.#element.querySelectorAll(selector);
  }

  bindEvents(element, eventMapping, defaultArgs) {
    const defaultArgArray = defaultArgs ?? [];

    Object.entries(eventMapping).forEach(([eventType, listener]) => {
      if (listener.extraArgs && listener.listener) {
        element.addEventListener(
          eventType,
          listener.listener.bind(
            this,
            ...defaultArgArray,
            ...listener.extraArgs
          )
        );
      } else {
        element.addEventListener(
          eventType,
          listener.bind(this, ...defaultArgArray)
        );
      }
    });
  }

  get name() {
    return this.#name;
  }

  get $element() {
    return this.#element;
  }

  get state() {
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

        const updatedState = updateCallback(target, prop, value);

        if (updatedState) {
          Object.keys(updatedState).forEach((prop) => {
            if (!target.hasOwnProperty(prop)) {
              throw new Error(`Unable to create new state property '${prop}'.`);
            }
            target[prop] = updatedState[prop];
          });
        }

        renderCallback(target);
        return true;
      },
    });
  }

  set state(value) {
    throw new Error(
      "Can't set attribute 'state'. You can not update the state directly."
    );
  }

  static mount() {
    if (!this.name) {
      throw new Error("Component name must be provided.");
    }
    const components = document.querySelectorAll(
      `[data-component="${this.name}"]`
    );

    components.forEach((component) => {
      new this(this.name, component);
    });
  }
}

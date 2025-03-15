const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1290,
  large: Infinity,
};

/**
 * Helper to work with breakpoints
 */
function getBreakpoint() {
  const screenSize = window.innerWidth;

  const breakpoint = Object.entries(BREAKPOINTS)
    .reverse()
    .reduce((breakpoint, [name, size]) => {
      if (size > screenSize) {
        return [name, size];
      }
      return breakpoint;
    });

  return breakpoint[0];
}

/**
 * Accept a mapping of breakpoint names (see `getBreakpoint` above) and return
 * the value corresponding to the current screen size
 */
function responsiveValue(mapping) {
  const currentBreakpoint = getBreakpoint();

  if (mapping.hasOwnProperty(currentBreakpoint)) {
    return mapping[currentBreakpoint];
  }
}

/**
 * Poor man's reactive framework
 */
class Stateful {
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

// TODO: Minify this
class Nav extends Stateful {
  ANIMATION_DURATION = 250; // ms

  elements = {
    nav: "js-nav",
    toggle: "js-nav-toggle",
  };

  classes = {
    hidden: "hidden",
  };

  static = {
    lastBreakpoint: null,
  };

  /* --- Elements --- */

  get $nav() {
    return document.querySelectorAll(`.${this.elements.nav}`);
  }

  get $toggle() {
    return document.querySelectorAll(`.${this.elements.toggle}`);
  }

  /* --- State --- */

  initialState() {
    return {
      isOpen: false,
    };
  }

  /* --- Actions --- */

  openNav() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    this.$nav.forEach((nav) => {
      nav.style.display = "";

      nav.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: this.ANIMATION_DURATION,
      });
    });

    this.$toggle.forEach((toggle) => {
      toggle.innerText = "Close";
    });

    if (breakpoint < BREAKPOINTS.desktop) {
      document.body.style.overflow = "hidden";
    }
  }

  closeNav() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    this.$nav.forEach((nav) => {
      nav
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: this.ANIMATION_DURATION,
        })
        .finished.then(() => [(nav.style.display = "none")]);
    });

    this.$toggle.forEach((toggle) => {
      toggle.innerText = "Menu";
    });

    if (breakpoint < BREAKPOINTS.desktop) {
      document.body.style.overflow = "visible";
    }
  }

  /* --- Handlers --- */

  onStateUpdate() {
    if (this.state.isOpen) {
      this.openNav();
    } else {
      this.closeNav();
    }
  }

  onToggleClick() {
    this.state.isOpen = !this.state.isOpen;
  }

  onWindowResize() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    if (
      this.static.lastBreakpoint < BREAKPOINTS.large &&
      breakpoint >= BREAKPOINTS.large
    ) {
      this.state.isOpen = false;
    }

    this.static.lastBreakpoint = breakpoint;
  }

  /* --- Main --- */

  mount() {
    this.closeNav();

    this.$toggle.forEach((toggle) =>
      toggle.addEventListener("click", this.onToggleClick.bind(this))
    );
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Nav().mount();
});

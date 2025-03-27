const BREAKPOINTS = {
  mobile: 0,
  tablet: 480,
  desktop: 768,
  large: 1290,
};

/**
 * Helper to work with breakpoints
 */
function getBreakpoint() {
  const screenSize = window.innerWidth;

  const breakpoint = Object.entries(BREAKPOINTS).reduce(
    (breakpoint, [name, size]) => {
      if (size < screenSize) {
        return [name, size];
      }
      return breakpoint;
    }
  );

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

function roundWithPrecision(value, { precision } = { precision: 2 }) {
  const exponent = 10 ** precision;

  return Math.round(value * exponent) / exponent;
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
    wasDesktopLayout: BREAKPOINTS[getBreakpoint()] >= BREAKPOINTS.large,
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

      if (breakpoint < BREAKPOINTS.large) {
        nav.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: this.ANIMATION_DURATION,
        });
      } else {
        // Use style instead of animation API to avoid jittery animations of max-height
        nav.style.maxHeight = `${nav.scrollHeight}px`;
      }
    });

    this.$toggle.forEach((toggle) => {
      toggle.innerText = "Close";
      toggle.setAttribute("aria-expanded", true);
    });

    if (breakpoint < BREAKPOINTS.large) {
      document.body.style.overflow = "hidden";
    }
  }

  closeNav() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    this.$nav.forEach((nav) => {
      if (breakpoint < BREAKPOINTS.large) {
        nav
          .animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: this.ANIMATION_DURATION,
          })
          .finished.then(() => [(nav.style.display = "none")]);
      }
      // Use style instead of animation API to avoid jittery animations of max-height
      nav.style.maxHeight = "";

      const transitionListener = () => {
        // Check `isOpen` again to handle if state has changed during transition
        if (!this.state.isOpen) {
          nav.style.display = "none";
        }
        nav.removeEventListener("transitionend", transitionListener);
      };
      nav.addEventListener("transitionend", transitionListener);
    });

    this.$toggle.forEach((toggle) => {
      toggle.innerText = "Menu";
      toggle.setAttribute("aria-expanded", false);
    });

    if (breakpoint < BREAKPOINTS.large) {
      document.body.style.overflow = "";
    }
  }

  hideNav() {
    this.$nav.forEach((nav) => {
      nav.style.display = "none";
    });

    this.$toggle.forEach((toggle) => {
      toggle.innerText = "Menu";
      toggle.setAttribute("aria-expanded", false);
    });

    document.body.style.overflow = "";
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

    const isDesktopLayout = breakpoint >= BREAKPOINTS.large;

    if (this.static.wasDesktopLayout !== isDesktopLayout) {
      this.state.isOpen = false;
    }

    this.static.wasDesktopLayout = isDesktopLayout;
  }

  /* --- Main --- */

  mount() {
    this.hideNav();

    this.$toggle.forEach((toggle) =>
      toggle.addEventListener("click", this.onToggleClick.bind(this))
    );

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }
}

// TODO:
// 1. Fix mobile sizing
//    a. Attach -ve margin top to .right
//    b. Add top: calc() to date
// 2. Snap scrolling to nearest contract

class ResumeTimeline extends Stateful {
  REVEAL_HEIGHT = 200; // px
  DOT_OFFSET = 18; // px

  elements = {
    contract: "js-contract",
    description: "js-description",
    line: "js-line",
    fill: "js-fill",
  };

  classes = {
    passed: "passed",
  };

  static = {
    activeAnimations: []
  }

  get $contract() {
    return document.querySelectorAll(`.${this.elements.contract}`);
  }

  $description(contract) {
    return contract.querySelector(`.${this.elements.description}`);
  }

  get $line() {
    return document.querySelectorAll(`.${this.elements.line}`);
  }

  $fill(line) {
    return line.querySelector(`.${this.elements.fill}`);
  }

  getClipHeight(target) {
    const boundingRect = target.getBoundingClientRect();

    const offset = this.REVEAL_HEIGHT - boundingRect.y;
    const asPercent = (offset * 100) / boundingRect.height;

    return roundWithPrecision(asPercent);
  }

  setTimelineProgress() {
    this.$line.forEach((line) => {
      const fill = this.$fill(line);
      const clipHeight = this.getClipHeight(line);
      const animationIndex = this.static.activeAnimations.indexOf(line)

      if (animationIndex < 0) {
        requestAnimationFrame(() => {
          fill.style.clipPath = `inset(${clipHeight}% 0 0 0)`;
          this.static.activeAnimations.splice(animationIndex, 1)
        });

        this.static.activeAnimations.push(line)
      }
    });
  }

  fillTimelineDots() {
    this.$contract.forEach((contract) => {
      const description = this.$description(contract);

      if (
        contract.getBoundingClientRect().y <=
        this.REVEAL_HEIGHT - this.DOT_OFFSET
      ) {
        description.classList.add(this.classes.passed);
      } else {
        description.classList.remove(this.classes.passed);
      }
    });
  }

  onScroll() {
    this.setTimelineProgress();
    this.fillTimelineDots();
  }

  mount() {
    document.addEventListener("scroll", this.onScroll.bind(this));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Nav().mount();
  new ResumeTimeline().mount();
});

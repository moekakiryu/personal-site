import { Stateful } from "./utils/stateful";
import { BREAKPOINTS, getBreakpoint } from "./utils/breakpoints";

export class Navigation extends Stateful {
  ANIMATION_DURATION = 250; // ms

  elements = {
    navigation: "js-nav",
    toggle: "js-nav-toggle",
  };

  classes = {
    hidden: "hidden",
  };

  static = {
    wasDesktopLayout: BREAKPOINTS[getBreakpoint()] >= BREAKPOINTS.large,
  };

  /* --- Elements --- */

  get $navigation() {
    return document.querySelectorAll(`.${this.elements.navigation}`);
  }

  get $toggle() {
    return document.querySelectorAll(`.${this.elements.toggle}`);
  }

  /* --- State --- */

  initialState() {
    return {
      isOpen: BREAKPOINTS[getBreakpoint()] >= BREAKPOINTS.large,
    };
  }

  /* --- Actions --- */

  openNav() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    this.$navigation.forEach((nav) => {
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

    this.$navigation.forEach((nav) => {
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
    this.$navigation.forEach((nav) => {
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

    if (isDesktopLayout) {
      this.state.isOpen = true;
    } else if (this.static.wasDesktopLayout !== isDesktopLayout) {
      this.state.isOpen = false;
    }

    this.static.wasDesktopLayout = isDesktopLayout;
  }

  /* --- Main --- */

  mount() {
    if (!this.state.isOpen) {
      this.hideNav();
    }

    this.$toggle.forEach((toggle) =>
      toggle.addEventListener("click", this.onToggleClick.bind(this))
    );

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }
}

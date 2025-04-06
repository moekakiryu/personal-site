import { Stateful } from "../utils/stateful";
import { BREAKPOINTS, getBreakpoint } from "../utils/breakpoints";

export class Navigation extends Stateful {
  ANIMATION_DURATION = 250; // ms

  static elements = {
    component: "js-header",
    desktopNav: "js-desktop-nav",
    mobileNav: "js-mobile-nav",
    toggle: "js-nav-toggle",
  };

  static classes = {
    hidden: "hidden",
  };

  /* --- Elements --- */

  get $desktopNav() {
    return this.$component.querySelector(`.${Navigation.elements.desktopNav}`);
  }

  get $mobileNav() {
    return this.$component.querySelector(`.${Navigation.elements.mobileNav}`);
  }

  get $toggle() {
    return this.$component.querySelector(`.${Navigation.elements.toggle}`);
  }

  constructor(component) {
    super();
    this.$component = component;

    this.bindEvents(window, {
      resize: this.onWindowResize,
    });

    this.bindEvents(this.$toggle, {
      click: this.onToggleClick,
    });

    if (!this.state.isOpen) {
      this.hideNav();
    }
  }

  /* --- State --- */

  initialState() {
    return {
      isOpen: BREAKPOINTS[getBreakpoint()] >= BREAKPOINTS.large,
    };
  }

  /* --- Actions --- */

  hideNav() {
    this.$mobileNav.style.display = "none";
    this.state.isOpen = false;
  }

  /* --- Handlers --- */

  onToggleClick() {
    this.state.isOpen = !this.state.isOpen;
  }

  onWindowResize() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    if (breakpoint >= BREAKPOINTS.large) {
      console.log('Close')
      this.state.isOpen = false;
    }
  }

  render() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    if (this.state.isOpen) {
      document.body.style.overflow = "hidden";

      this.$toggle.innerText = "Close";
      this.$toggle.setAttribute("aria-expanded", true);

      this.$mobileNav.style.display = "";

      this.$mobileNav.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: this.ANIMATION_DURATION,
      });
    } else {
      document.body.style.overflow = "";

      this.$toggle.innerText = "Menu";
      this.$toggle.setAttribute("aria-expanded", false);

      this.$mobileNav
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: this.ANIMATION_DURATION,
        })
        .finished.then(() => {
          this.$mobileNav.style.display = "none";
        });
    }
  }

  /* --- Main --- */
  static mount() {
    const components = document.querySelectorAll(`.${this.elements.component}`);

    components.forEach((navElement) => {
      new this(navElement);
    });
  }
}

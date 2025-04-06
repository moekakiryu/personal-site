import { BaseComponent } from "../utils/BaseComponent";
import { BREAKPOINTS, getBreakpoint } from "../utils/breakpoints";

export class Navigation extends BaseComponent {
  ANIMATION_DURATION = 250; // ms

  static name = "Navigation";

  static classes = {
    hidden: "hidden",
  };

  constructor(name, element) {
    super(name, element);

    this.bindEvents(window, {
      resize: this.onWindowResize,
    });

    this.bindEvents(this.$toggle, {
      click: this.onToggleClick,
    });

    this.hideNav();
  }

  /* --- Elements --- */

  get $desktopNav() {
    return this.getElement("desktopNav");
  }

  get $mobileNav() {
    return this.getElement("mobileNav");
  }

  get $toggle() {
    return this.getElement("toggle");
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
      console.log("Close");
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
  // static mount() {
  //   const components = document.querySelectorAll(`.${this.elements.component}`);

  //   components.forEach((component) => {
  //     new this(component);
  //   });
  // }
}

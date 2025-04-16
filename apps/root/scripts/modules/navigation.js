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
  get $mobileNavigation() {
    return this.getElement("mobileNavigation");
  }

  renderMobileNav() {
    if (this.state.isOpen) {
      this.$mobileNavigation.style.display = "";

      this.$mobileNavigation.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: this.ANIMATION_DURATION,
      });
    } else {
      this.$mobileNavigation
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: this.ANIMATION_DURATION,
        })
        .finished.then(() => {
          this.$mobileNavigation.style.display = "none";
        });
    }
  }

  get $toggle() {
    return this.getElement("toggle");
  }

  renderToggle() {
    this.$toggle.innerText = this.state.isOpen ? "Close" : "Menu";
    this.$toggle.setAttribute("aria-expanded", this.state.isOpen);
  }

  /* --- State --- */

  initialState() {
    return {
      isOpen: BREAKPOINTS[getBreakpoint()] >= BREAKPOINTS.large,
    };
  }

  /* --- Actions --- */

  hideNav() {
    this.$mobileNavigation.style.display = "none";
    this.state.isOpen = false;
  }

  /* --- Handlers --- */

  onToggleClick() {
    this.state.isOpen = !this.state.isOpen;
  }

  onWindowResize() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    if (breakpoint >= BREAKPOINTS.large) {
      this.state.isOpen = false;
    }
  }

  render() {
    document.body.style.overflow = this.state.isOpen ? "hidden" : "";

    this.renderMobileNav();
    this.renderToggle();
  }
}

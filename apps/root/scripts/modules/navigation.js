import { BaseComponent } from "../utils/BaseComponent";
import { BREAKPOINTS, getBreakpoint } from "../utils/breakpoints";

export class Navigation extends BaseComponent {
  ANIMATION_DURATION = 250; // ms

  static name = "Navigation";

  static classes = {
    top: "top",
    open: "open",
  };

  constructor(name, element) {
    super(name, element);

    this.bindEvents(window, {
      resize: this.onWindowResize,
    });

    this.bindEvents(this.$mobileNavigation, {
      click: this.onMobileNavigationClick,
    });

    this.bindEvents(this.$toggle, {
      click: this.onToggleClick,
    });

    this.attachScrollObserver();
    this.state.isOpen = false;
  }

  /* --- Elements --- */
  get $mobileNavigation() {
    return this.getElement("mobileNavigation");
  }

  get $toggle() {
    return this.getElement("toggle");
  }

  get $fadeArea() {
    return this.getElement("fadeArea");
  }

  /* --- State --- */

  values = {
    observer: null,
  };

  initialState() {
    return {
      isTop: true,
      isOpen: BREAKPOINTS[getBreakpoint()] >= BREAKPOINTS.large,
    };
  }

  /* --- Actions --- */

  attachScrollObserver() {
    if (this.values.observer) {
      this.values.observer.observer.disconnect();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        this.state.isTop = !entry.isIntersecting;
      },
      {
        rootMargin: `0px 0px -100%`,
      }
    );

    observer.observe(document.querySelector("main"));

    this.values.observer = {
      observer,
      reconnect: () => this.attachScrollObserver(),
    };

    return observer;
  }

  hideElement(target) {
    target
      .animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: this.ANIMATION_DURATION,
      })
      .finished.then(() => {
        target.style.display = "none";
      });
  }

  showElement(target) {
    target.style.display = "";
    target.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: this.ANIMATION_DURATION,
    });
  }

  /* --- Handlers --- */

  onToggleClick() {
    this.state.isOpen = !this.state.isOpen;
  }

  onMobileNavigationClick({ target, currentTarget }) {
    if (target === currentTarget) {
      this.state.isOpen = false;
    }
  }

  onWindowResize() {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    if (breakpoint < BREAKPOINTS.desktop) {
      if (!this.state.isTop && !this.state.isOpen) {
        this.$fadeArea.style.display = 'none';
      }
    }

    if (breakpoint >= BREAKPOINTS.desktop) {
      this.$fadeArea.style.display = ''
    }

    if (breakpoint >= BREAKPOINTS.large) {
      this.state.isOpen = false;
    }
  }

  render(_, prop) {
    const breakpoint = BREAKPOINTS[getBreakpoint()];

    document.body.style.overflow = this.state.isOpen ? "hidden" : "";

    this.$toggle.innerText = this.state.isOpen ? "Close" : "Menu";
    this.$toggle.setAttribute("aria-expanded", this.state.isOpen);

    if (this.state.isOpen) {
      this.showElement(this.$mobileNavigation);
    } else {
      this.hideElement(this.$mobileNavigation);
    }
    this.$element.classList.toggle(Navigation.classes.open, this.state.isOpen);

    if (breakpoint < BREAKPOINTS.desktop) {
      if (this.state.isTop) {
        if (prop === 'isTop') {
          this.showElement(this.$fadeArea)
        }
      } else if (this.state.isOpen) {
        this.showElement(this.$fadeArea)
      } else {
        this.hideElement(this.$fadeArea)
      }
    }
    this.$element.classList.toggle(Navigation.classes.top, this.state.isTop);
  }
}

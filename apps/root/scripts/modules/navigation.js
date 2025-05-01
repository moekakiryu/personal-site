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
    pendingAnimations: new Map(),
  };

  initialState() {
    return {
      isTop: true,
      isOpen: false,
    };
  }

  /* --- Actions --- */

  attachScrollObserver() {
    if (this.values.observer) {
      this.values.observer.observer.disconnect();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const breakpoint = BREAKPOINTS[getBreakpoint()];

        if (breakpoint < BREAKPOINTS.desktop) {
          this.state.isTop = !entry.isIntersecting;
        }
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
    const animation = target.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: this.ANIMATION_DURATION,
    });

    animation.finished
      .then(() => {
        target.style.display = "none";
        this.values.pendingAnimations.delete(target);
      })
      .catch((e) => {
        if (!(e instanceof DOMException)) {
          throw e;
        }
      });

    if (this.values.pendingAnimations.get(target)) {
      this.values.pendingAnimations.get(target).cancel();
    }
    this.values.pendingAnimations.set(target, animation);
  }

  showElement(target) {
    if (
      target.style.display !== "none" &&
      !this.values.pendingAnimations.get(target)
    )
      return;
    target.style.display = "";

    const animation = target.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: this.ANIMATION_DURATION,
    });

    animation.finished
      .then(() => {
        this.values.pendingAnimations.delete(target);
      })
      .catch((e) => {
        if (!(e instanceof DOMException)) {
          throw e;
        }
      });

    if (this.values.pendingAnimations.get(target)) {
      this.values.pendingAnimations.get(target).cancel();
    }
    this.values.pendingAnimations.set(target, animation);
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
        this.$fadeArea.style.display = "none";
      }
    }

    if (breakpoint >= BREAKPOINTS.desktop) {
      this.$fadeArea.style.display = "";
    }
  }

  render() {
    document.body.style.overflow = this.state.isOpen ? "hidden" : "";

    this.$toggle.innerText = this.state.isOpen ? "Close" : "Menu";
    this.$toggle.setAttribute("aria-expanded", this.state.isOpen);

    this.state.isOpen
      ? this.showElement(this.$mobileNavigation)
      : this.hideElement(this.$mobileNavigation);

    this.state.isTop || this.state.isOpen
      ? this.showElement(this.$fadeArea)
      : this.hideElement(this.$fadeArea);

    this.$element.classList.toggle(Navigation.classes.top, this.state.isTop);
    this.$element.classList.toggle(Navigation.classes.open, this.state.isOpen);
  }
}

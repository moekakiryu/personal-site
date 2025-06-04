import { BaseComponent } from "../utils/BaseComponent";

export class Accordion extends BaseComponent {
  static name = "Accordion";

  static classes = {
    transitioning: "transitioning",
    inactive: "inactive"
  };

  constructor(name, element) {
    super(name, element);

    this.$$toggles.forEach(($toggle) =>
      this.bindEvents($toggle, {
        click: {
          listener: this.onToggleClick,
          extraArgs: [$toggle],
        },
      })
    );

    this.$$items.forEach(($item) => {
      this.bindEvents($item, {
        transitionend: {
          listener: this.onTransitionEnd,
          extraArgs: [$item]
        },
      })
      if ($item.id !== this.state.activeItemId) {
        $item.style.display = "none";
        $item.classList.add(Accordion.classes.inactive)
      }
    });
  }

  initialState() {
    const activeItem = Array.from(this.$$toggles).find(
      ($toggle) => $toggle.getAttribute("aria-expanded") === true
    );
    const firstItem = Array.from(this.$$toggles)[0];

    const activeItemId = (activeItem ?? firstItem).getAttribute(
      "aria-controls"
    );

    return {
      activeItemId,
      lastActiveItemId: activeItemId,
    };
  }

  get $$toggles() {
    return this.getElements("toggle");
  }

  get $$items() {
    return this.getElements("item");
  }

  onToggleClick($toggle) {
    this.state.lastActiveItemId = this.state.activeItemId;
    this.state.activeItemId = $toggle.getAttribute("aria-controls");
  }

  onTransitionEnd($item, { pseudoElement }) {
    if (pseudoElement) {
      return
    }

    if ($item.id !== this.state.activeItemId) {
      $item.style.display = 'none'
    }
    $item.classList.remove(Accordion.classes.transitioning)
  }

  render() {
    if (this.state.activeItemId === this.state.lastActiveItemId) return;

    this.$$toggles.forEach(($toggle) => {
      $toggle.setAttribute(
        "aria-expanded",
        $toggle.getAttribute("aria-controls") === this.state.activeItemId
      );
    });

    this.$$items.forEach(($item, index) => {
      const isActive = $item.id === this.state.activeItemId;
      const wasActive = $item.id === this.state.lastActiveItemId;

      if (isActive || wasActive) {
        $item.style.display = "";
        $item.classList.add(Accordion.classes.transitioning);

        // Instant timeout to prevent animation from being cancelled by the
        // `display` toggle above
        setTimeout(() => {
          if (isActive) {
            $item.classList.remove(Accordion.classes.inactive)
          } else {
            $item.classList.add(Accordion.classes.inactive)
          }
        }, 0)
      }
    });
  }
}

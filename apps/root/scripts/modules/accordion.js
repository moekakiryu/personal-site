import { BaseComponent } from "../utils/BaseComponent";

export class Accordion extends BaseComponent {
  static name = "Accordion";

  static classes = {
    transitioning: "transitioning",
    hidden: "hidden",
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

    this.$$items.forEach(($item) =>
      this.bindEvents($item, {
        transitionend: {
          listener: this.onItemTransitionEnd,
          extraArgs: [$item],
        },
      })
    );

    // Initialize accordion items
    this.$$items.forEach($item => {
      if ($item.id !== this.state.activeItemId) {
        $item.classList.add(Accordion.classes.hidden)
        $item.style.display = 'none'
      }
    })
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
    };
  }

  get $$toggles() {
    return this.getElements("toggle");
  }

  get $$items() {
    return this.getElements("item");
  }

  onToggleClick($toggle) {
    this.state.activeItemId = $toggle.getAttribute("aria-controls");
  }

  onItemTransitionEnd($item) {
    $item.classList.remove(Accordion.classes.transitioning);
    if ($item.id !== this.state.activeItemId) {
      $item.style.display = 'none'
    }
  }

  render() {
    this.$$toggles.forEach(($toggle) => {
      $toggle.setAttribute(
        "aria-expanded",
        $toggle.getAttribute("aria-controls") === this.state.activeItemId
      );
    });

    this.$$items.forEach(($item) => {
      const isActive = $item.id === this.state.activeItemId;
      const wasActive = !$item.classList.contains(Accordion.classes.hidden);

      if (isActive === wasActive) {
        return
      }

      if (isActive || wasActive) {
        $item.style.display = "";
        $item.classList.add(Accordion.classes.transitioning)
      }
      setTimeout(() => {
        $item.classList.toggle(Accordion.classes.hidden, !isActive);
      })
    });
  }
}

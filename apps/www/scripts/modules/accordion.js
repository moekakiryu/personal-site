import { BaseComponent } from "../utils/BaseComponent";

export class Accordion extends BaseComponent {
  static name = "Accordion";

  static classes = {
    transitioning: "transitioning",
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
      if ($item.id !== this.state.activeItemId) {
        $item.style.display = "none";
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

        const activeAnimations = $item.getAnimations();

        activeAnimations.forEach((animation) => animation.cancel());

        requestAnimationFrame(() => {
          // Assume there are only two accordion items
          // TODO: If accordion is ever used elsewhere, refactor to account for multiple items
          const swipeDirection = index == 0 ? -1 : 1;
          const fadeAnimation = [{ maskPosition: 0 }, { maskPosition: `${swipeDirection * 100}%` }];

          const keyframes = isActive ? fadeAnimation : fadeAnimation.reverse();
          const timings = {
            duration: 250,
          };

          $item.animate(keyframes, timings).finished.then(() => {
            $item.classList.remove(Accordion.classes.transitioning);
            if (!isActive) {
              $item.style.display = "none";
            }
          });
        });
      }
    });
  }
}

import { BaseComponent } from "../utils/BaseComponent";

export class Accordion extends BaseComponent {
  static name = "Accordion";

  static classes = {
    hidden: "hidden",
  };

  constructor(name, element) {
    super(name, element);

    this.$$toggles.forEach($toggle => {
      $toggle.addEventListener('click', this.onToggleClick.bind(this, $toggle))
    })
  }

  get $$toggles() {
    return this.getElements("toggle");
  }

  renderToggles() {
    this.$$toggles.forEach(($toggle) => {
      const itemId = $toggle.getAttribute("aria-controls");

      $toggle.setAttribute("aria-expanded", itemId === this.state.activeItemId);
    });
  }

  get $$items() {
    return this.getElements("item");
  }

  renderItems() {
    this.$$items.forEach(($item) => {
      $item.classList.toggle(
        Accordion.classes.hidden,
        $item.getAttribute("id") !== this.state.activeItemId
      );
    });
  }

  initialState() {
    const activeItem = Array.from(this.$$toggles).find(
      ($toggle) => $toggle.getAttribute("aria-expanded") === true
    );
    const firstItem = Array.from(this.$$toggles)[0];

    return {
      activeItemId: (activeItem ?? firstItem).getAttribute("aria-controls"),
    };
  }

  onToggleClick($toggle) {
    this.state.activeItemId = $toggle.getAttribute('aria-controls')
  }

  render() {
    this.renderToggles();
    this.renderItems();
  }
}

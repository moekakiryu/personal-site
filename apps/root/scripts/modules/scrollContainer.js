import { clamp } from "../utils/math";
import { Stateful } from "../utils/stateful";

export class ScrollContainer extends Stateful {
  static elements = {
    component: "js-scroll-container",
    content: "js-content",
  };

  static mount() {
    const components = document.querySelectorAll(`.${this.elements.component}`);

    components.forEach((scrollContainer) => {
      new this(scrollContainer);
    });
  }

  constructor(component) {
    super();
    this.$component = component;

    this._bindEvents(component, {
      wheel: this.onMouseWheel,

      mousedown: this.onMouseDown,
      mousemove: this.onMouseMove,
      mouseleave: this.onMouseLeave,

      touchstart: this.onTouchStart,
      touchmove: this.onTouchMove,
    })
  }
  
  initialState() {
    return {
      scrollOffset: 0,
    };
  }

  persist = {
    dragStart: null,
    touchId: null,
  };

  get $content() {
    return this.$component.querySelector(
      `.${ScrollContainer.elements.content}`
    );
  }

  setScrollOffset(offset) {
    this.state.scrollOffset = clamp(offset, {
      min: 0,
      max: this.$content.scrollWidth - this.$component.clientWidth,
    });
  }

  // --- Content Wheel events --- //

  onMouseWheel({ shiftKey, deltaY }) {
    // Only accept wheel events if the user is trying to scroll horizontally
    if (!shiftKey) return;

    this.setScrollOffset(this.state.scrollOffset + deltaY);
  }

  // --- Content Mouse events --- //

  onMouseDown({ pageX }) {
    this.persist.dragStart = pageX;

    const mouseUpListener = () => {
      this.persist.dragStart = null;
      window.removeEventListener("mouseup", mouseUpListener);
    };

    window.addEventListener("mouseup", mouseUpListener);
  }

  onMouseMove({ pageX }) {
    if (this.persist.dragStart === null) return;

    this.setScrollOffset(
      this.state.scrollOffset + (this.persist.dragStart - pageX)
    );
    this.persist.dragStart = pageX;
  }

  onMouseLeave() {
    this.persist.dragStart = null;
  }

  // --- Content Touch events --- //

  onTouchStart({ touches }) {
    const activeTouch = touches[0];

    this.persist.dragStart = activeTouch.pageX;
    this.persist.touchId = activeTouch.identifier;

    const touchEndListener = () => {
      this.persist.dragStart = null;
      this.persist.touchId = null;
      window.removeEventListener("touchend", touchEndListener);
    };

    window.addEventListener("touchend", touchEndListener);
  }

  onTouchMove(event) {
    const activeTouch = Array.from(event.touches).find(
      (touch) => touch.identifier === this.persist.touchId
    );

    if (!activeTouch) {
      this.persist.dragStart = null;
      this.persist.touchId = null;
      return;
    }

    event.preventDefault();
    this.setScrollOffset(
      this.state.scrollOffset + (this.persist.dragStart - activeTouch.pageX)
    );
    this.persist.dragStart = activeTouch.pageX;
  }

  onStateUpdate() {
    this.$content.style.marginLeft = `-${this.state.scrollOffset}px`;
  }
}

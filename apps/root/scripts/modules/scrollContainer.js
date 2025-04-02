import { clamp } from "../utils/math";
import { Stateful } from "../utils/stateful";

export class ScrollContainer extends Stateful {
  static elements = {
    component: "js-scroll-container",
    content: "js-content",
    track: "js-track",
    thumb: "js-thumb",
  };

  get $content() {
    return this.$component.querySelector(
      `.${ScrollContainer.elements.content}`
    );
  }

  get $track() {
    return this.$component.querySelector(`.${ScrollContainer.elements.track}`);
  }

  get $thumb() {
    return this.$component.querySelector(`.${ScrollContainer.elements.thumb}`);
  }

  constructor(component) {
    super();
    this.$component = component;

    this.onWindowResize();

    this._bindEvents(window, {
      resize: this.onWindowResize,
    });

    this._bindEvents(component, {
      wheel: this.onMouseWheel,

      mousedown: this.onContentMouseDown,
      mousemove: this.onContentMouseMove,
      mouseleave: this.onContentMouseLeave,

      touchstart: this.onContentTouchStart,
      touchmove: this.onContentTouchMove,
    });
  }

  initialState() {
    return {
      scrollOffset: 0,
      thumbWidth: 0,
    };
  }

  persist = {
    dragStart: null,
    touchId: null,
  };

  // --- Content Wheel events --- //

  onMouseWheel({ shiftKey, deltaY }) {
    // Only accept wheel events if the user is trying to scroll horizontally
    if (!shiftKey) return;

    const availableContentWidth =
      this.$content.scrollWidth - this.$component.clientWidth;
    this.state.scrollOffset = clamp(
      this.state.scrollOffset + deltaY / availableContentWidth,
      {
        min: 0,
        max: 1
      }
    )
  }

  // --- Content Mouse events --- //

  onContentMouseDown({ pageX }) {
    this.persist.dragStart = pageX;

    const mouseUpListener = () => {
      this.persist.dragStart = null;
      window.removeEventListener("mouseup", mouseUpListener);
    };

    window.addEventListener("mouseup", mouseUpListener);
  }

  onContentMouseMove({ pageX }) {
    if (this.persist.dragStart === null) return;

    const delta = this.persist.dragStart - pageX;
    const availableContentWidth =
      this.$content.scrollWidth - this.$component.clientWidth;

    this.state.scrollOffset = clamp(
      this.state.scrollOffset + delta / availableContentWidth,
      { min: 0, max: 1 }
    );

    this.persist.dragStart = pageX;
  }

  onContentMouseLeave() {
    this.persist.dragStart = null;
  }

  // --- Content Touch events --- //

  onContentTouchStart({ touches }) {
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

  onContentTouchMove(event) {
    const activeTouch = Array.from(event.touches).find(
      (touch) => touch.identifier === this.persist.touchId
    );

    if (!activeTouch) {
      this.persist.dragStart = null;
      this.persist.touchId = null;
      return;
    }

    event.preventDefault();

    const delta = this.persist.dragStart - activeTouch.pageX;
    const availableContentWidth =
      this.$content.scrollWidth - this.$component.clientWidth;

    this.state.scrollOffset = clamp(
      this.state.scrollOffset + delta / availableContentWidth,
      { min: 0, max: 1 }
    );

    this.persist.dragStart = activeTouch.pageX;
  }

  // --- Window events --- //
  onWindowResize() {
    this.state.thumbWidth =
      this.$track.clientWidth *
      (this.$component.clientWidth / this.$content.scrollWidth);
  }

  onStateUpdate() {
    // Compute px values from percentage offsets
    const availableTrackWidth =
      this.$track.clientWidth - this.$thumb.clientWidth;
    const availableContentWidth =
      this.$content.scrollWidth - this.$component.clientWidth;

    const thumbOffset = this.state.scrollOffset * availableTrackWidth;
    const contentOffset = this.state.scrollOffset * availableContentWidth;

    // Update element attributes
    this.$content.style.marginLeft = `-${contentOffset}px`;

    this.$thumb.style.marginLeft = `${thumbOffset}px`;
    this.$thumb.style.width = `${this.state.thumbWidth}px`;
  }

  static mount() {
    const components = document.querySelectorAll(`.${this.elements.component}`);

    components.forEach((scrollContainer) => {
      new this(scrollContainer);
    });
  }
}

import { clamp } from "../utils/math";
import { Stateful } from "../utils/stateful";

export class ScrollContainer extends Stateful {
  static elements = {
    component: "js-scroll-container",
    viewport: "js-viewport",
    content: "js-content",
    track: "js-track",
    thumb: "js-thumb",
  };

  get $viewport() {
    return this.$component.querySelector(
      `.${ScrollContainer.elements.viewport}`
    );
  }

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

    this.bindEvents(window, {
      resize: this.onWindowResize,
    });

    this.bindEvents(this.$viewport, {
      wheel: this.onMouseWheel,
      mousedown: this.onContentMouseDown,
      touchstart: this.onContentTouchStart,
      touchmove: this.onContentTouchMove,
    });

    this.bindEvents(this.$track, {
      wheel: this.onMouseWheel,
      mousedown: this.onTrackMouseDown,
    });
  }

  initialState() {
    return {
      scrollOffset: 0,
      thumbWidth: 0,
    };
  }

  references = {
    lastPageX: null,
    touchId: null,
  };

  get availableContentWidth() {
    return this.$content.scrollWidth - this.$viewport.clientWidth;
  }

  get availableTrackWidth() {
    return this.$track.clientWidth - this.$thumb.clientWidth;
  }

  // --- Mouse Wheel Events --- //

  onMouseWheel({ shiftKey, deltaY }) {
    // Only accept wheel events if the user is trying to scroll horizontally
    if (!shiftKey) return;

    this.state.scrollOffset = clamp(
      this.state.scrollOffset + deltaY / this.availableContentWidth,
      {
        min: 0,
        max: 1,
      }
    );
  }

  // --- Scroll Content Events --- //

  onContentMouseDown({ pageX }) {
    this.references.lastPageX = pageX;
    document.body.style.userSelect = "none";

    const mouseMoveListener = ({ pageX }) => {
      // lastPageX shouldn't ever be null here, but unbind event listeners if it is
      if (this.references.lastPageX === null) {
        document.body.style.userSelect = '';

        window.removeEventListener("mouseup", mouseUpListener);
        window.removeEventListener("mousemove", mouseMoveListener);
        return
      };

      const delta = this.references.lastPageX - pageX;

      this.state.scrollOffset = clamp(
        this.state.scrollOffset + delta / this.availableContentWidth,
        { min: 0, max: 1 }
      );

      this.references.lastPageX = pageX;
    };

    const mouseUpListener = () => {
      this.references.lastPageX = null;
      document.body.style.userSelect = "";

      window.removeEventListener("mouseup", mouseUpListener);
      window.removeEventListener("mousemove", mouseMoveListener);
    };

    // Attach listeners to window to allow mouse to leave scroll area
    window.addEventListener("mouseup", mouseUpListener);
    window.addEventListener("mousemove", mouseMoveListener);
  }

  onContentTouchStart({ touches }) {
    const activeTouch = touches[0];

    this.references.lastPageX = activeTouch.pageX;
    this.references.touchId = activeTouch.identifier;
  }

  onContentTouchMove(event) {
    const activeTouch = Array.from(event.touches).find(
      (touch) => touch.identifier === this.references.touchId
    );

    if (!activeTouch) {
      this.references.lastPageX = null;
      this.references.touchId = null;
      return;
    }

    event.preventDefault();

    const delta = this.references.lastPageX - activeTouch.pageX;

    this.state.scrollOffset = clamp(
      this.state.scrollOffset + delta / this.availableContentWidth,
      { min: 0, max: 1 }
    );

    this.references.lastPageX = activeTouch.pageX;
  }

  // --- Scroll Track Events --- //

  onTrackMouseDown({ pageX }) {
    const relativeOffset = pageX - this.$track.offsetLeft;
    const thumbCenter = this.$thumb.clientWidth / 2;

    this.state.scrollOffset = clamp(
      (relativeOffset - thumbCenter) / this.availableTrackWidth,
      {
        min: 0,
        max: 1,
      }
    );
  }

  // --- Window events --- //

  onWindowResize() {
    const percentageShown =
      this.$viewport.clientWidth / this.$content.scrollWidth;

    this.state.thumbWidth = this.$track.clientWidth * percentageShown;
  }

  onStateUpdate() {
    // Compute px values from percentage offsets
    const thumbOffset = this.state.scrollOffset * this.availableTrackWidth;
    const contentOffset = this.state.scrollOffset * this.availableContentWidth;

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

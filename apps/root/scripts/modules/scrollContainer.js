import { clamp } from "../utils/math";
import { Stateful } from "../utils/stateful";

export class ScrollContainer extends Stateful {
  EPSILON = 5

  static elements = {
    component: "js-scroll-container",
    viewport: "js-viewport",
    content: "js-content",
    track: "js-track",
    thumb: "js-thumb",
    backButton: "js-back-button",
    forwardButton: "js-forward-button",
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

  get $backButton() {
    return this.$component.querySelector(
      `.${ScrollContainer.elements.backButton}`
    );
  }

  get $forwardButton() {
    return this.$component.querySelector(
      `.${ScrollContainer.elements.forwardButton}`
    );
  }

  constructor(component) {
    super();
    this.$component = component;

    this.onWindowResize();

    // Note most of these events have an initial condition to skip if not active.
    // This may be an easy place to refactor if performance becomes an issue,
    // but I'll leave it in place for now as it creates a nice pattern for this
    // component and shouldn't be used very often.
    this.bindEvents(window, {
      resize: this.onWindowResize,
      mousemove: this.onWindowMouseMove,
      touchmove: this.onWindowTouchMove,
      click: this.onWindowClick,
    });

    this.bindEvents(this.$viewport, {
      wheel: this.onMouseWheel,
      mousedown: this.onContentMouseDown,
      touchstart: this.onContentTouchStart,
    });

    this.bindEvents(this.$track, {
      wheel: this.onMouseWheel,
      mousedown: this.onTrackMouseDown,
    });

    this.bindEvents(this.$thumb, {
      mousedown: this.onThumbMouseDown,
    });

    this.bindEvents(this.$backButton, {
      click: this.onBackButtonClick,
    });

    this.bindEvents(this.$forwardButton, {
      click: this.onForwardButtonClick,
    });
  }

  initialState() {
    return {
      scrollOffset: 0,
      thumbWidth: 0,
      scrollType: null, // 'content' | 'scrollbar'
    };
  }

  references = {
    pageX: null,
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

  onContentMouseDown(event) {
    event.preventDefault();
    this.state.scrollType = 'content'
  }

  onContentTouchStart({ touches }) {
    const activeTouch = touches[0];
    this.references.touchId = activeTouch.identifier;
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

    // Manually set pageX to start dragging from the new thumb position (set above)
    this.state.scrollType = 'scrollbar'
    this.references.pageX = pageX
  }

  onThumbMouseDown(event) {
    event.stopPropagation();
    this.state.scrollType = 'scrollbar'
  }

  // --- Button Events --- //

  onBackButtonClick() {
    this.state.scrollOffset = clamp(this.state.scrollOffset - 0.1, {
      min: 0,
      max: 1,
    });
  }

  onForwardButtonClick() {
    this.state.scrollOffset = clamp(this.state.scrollOffset + 0.1, {
      min: 0,
      max: 1,
    });
  }

  // --- Window events --- //

  onWindowResize() {
    const percentVisible =
      this.$viewport.clientWidth / this.$content.scrollWidth;

    this.state.thumbWidth = this.$track.clientWidth * percentVisible;
  }

  onWindowMouseMove(event) {
    if (this.state.scrollType === null) return;

    event.preventDefault();

    const delta = event.pageX - (this.references.pageX ?? event.pageX)

    switch (this.state.scrollType) {
      case 'content':
        this.state.scrollOffset = clamp(
          this.state.scrollOffset - delta / this.availableContentWidth,
          { min: 0, max: 1 }
        );
        break
      case 'scrollbar':
        this.state.scrollOffset = clamp(
          this.state.scrollOffset + delta / this.availableTrackWidth,
          { min: 0, max: 1 }
        );
        break
    }

    this.references.pageX = event.pageX;
  }

  onWindowClick(event) {
    // Has a scroll been initiated AND has the mouse moved since then
    if (this.state.scrollType !== null && this.references.pageX !== null) event.preventDefault();
    this.state.scrollType = null
    this.references.pageX = null;
  }

  onWindowTouchMove(event) {
    if (this.references.touchId === null) return;

    const activeTouch = Array.from(event.touches).find(
      (touch) => touch.identifier === this.references.touchId
    );

    if (!activeTouch) {
      this.references.pageX = null;
      this.references.touchId = null;
      return;
    }

    event.preventDefault();

    const lastPageX = this.references.pageX ?? activeTouch.pageX;
    const delta = this.references.pageX - activeTouch.pageX;

    this.state.scrollOffset = clamp(
      this.state.scrollOffset + delta / this.availableContentWidth,
      { min: 0, max: 1 }
    );

    this.references.pageX = activeTouch.pageX;
  }

  // TODO: Add accessibility
  // TODO: Add snap to child
  onStateUpdate() {
    const isStart = this.state.scrollOffset === 0;
    const isEnd = this.state.scrollOffset === 1;

    // Compute px values from percentage offsets
    const thumbOffset = this.state.scrollOffset * this.availableTrackWidth;
    const contentOffset = this.state.scrollOffset * this.availableContentWidth;

    // If a scroll event would place the scrollbar close the either end, update
    // the state to exactly equal the end
    if (!isStart && contentOffset < this.EPSILON) {
      this.state.scrollOffset = 0
      return
    }

    if (!isEnd && contentOffset > (this.availableContentWidth - this.EPSILON)) {
      this.state.scrollOffset = 1
      return
    }

    // Update element attributes
    this.$content.style.marginLeft = `-${contentOffset}px`;

    this.$thumb.style.marginLeft = `${thumbOffset}px`;
    this.$thumb.style.width = `${this.state.thumbWidth}px`;

    switch (this.state.scrollType) {
      case 'content':
        document.body.style.userSelect = "none";
        document.body.style.cursor = "pointer";
        break

      case 'scrollbar':
        document.body.style.userSelect = "none";
        document.body.style.cursor = "pointer";
        this.$track.classList.add('active')
        break

      default:
        this.$track.classList.remove('active')
        document.body.style.userSelect = ""; 
        document.body.style.cursor = ""; 
    }

    // TODO: Move these into classes object
    this.$component.classList.toggle("scroll-start", isStart);
    this.$component.classList.toggle("scroll-end", isEnd);

    this.$backButton.removeAttribute("disabled");
    this.$forwardButton.removeAttribute("disabled");
    if (isStart) {
      this.$backButton.setAttribute("disabled", true);
    }
    if (isEnd) {
      this.$forwardButton.setAttribute("disabled", true);
    }
  }

  static mount() {
    const components = document.querySelectorAll(`.${this.elements.component}`);

    components.forEach((scrollContainer) => {
      new this(scrollContainer);
    });
  }
}

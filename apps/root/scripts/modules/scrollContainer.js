import { clamp, roundWithPrecision as roundDecimal } from "../utils/math";
import { Stateful } from "../utils/stateful";

export class ScrollContainer extends Stateful {
  EPSILON = 5;
  SNAP_PADDING = 50;

  static elements = {
    component: "js-scroll-container",
    viewport: "js-viewport",
    content: "js-content",
    controls: "js-controls",
    track: "js-track",
    thumb: "js-thumb",
    backButton: "js-back-button",
    forwardButton: "js-forward-button",
  };

  static classes = {
    active: "active",
    scrollStart: "scroll-start",
    scrollEnd: "scroll-end",
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

  get $controls() {
    return this.$component.querySelector(
      `.${ScrollContainer.elements.controls}`
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

  get $$snapTargets() {
    return this.$component.querySelectorAll("[data-snap]");
  }

  constructor(component) {
    super();
    this.$component = component;

    this.onWindowResize();

    this.bindEvents(window, {
      // Note most of these events have an initial condition to skip if not
      // active.This may be an easy place to refactor if performance becomes an
      // issue, but I'll leave it in place for now as it creates a nice pattern
      // for this component and shouldn't be used very often.
      resize: this.onWindowResize,
      mousemove: this.onWindowMouseMove,
      touchmove: this.onWindowTouchMove,
      touchend: this.onWindowTouchEnd,
      click: this.onWindowClick,
    });

    this.bindEvents(this.$viewport, {
      wheel: this.onMouseWheel,
      mousedown: this.onContentMouseDown,
      touchstart: this.onContentTouchStart,
      keydown: this.onContentKeyDown,
      focusin: this.onContentFocusChange,
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
      scrollType: null, // 'content' | 'scrollbar' | 'touch'
    };
  }

  values = {
    pageX: null,
    direction: 0,
  };

  get availableContentWidth() {
    return this.$content.scrollWidth - this.$viewport.clientWidth;
  }

  get availableTrackWidth() {
    return this.$track.clientWidth - this.$thumb.clientWidth;
  }

  // Actions

  scrollNext() {
    const nextSnapTarget = Array.from(this.$$snapTargets).find((target) => {
      return (
        target.offsetLeft + target.offsetWidth > this.$viewport.clientWidth
      );
    });

    if (nextSnapTarget) {
      const targetRight =
        nextSnapTarget.offsetLeft + nextSnapTarget.offsetWidth;
      const viewportRight = this.$viewport.clientWidth;

      const deltaRight = (targetRight - viewportRight) / this.availableContentWidth
      const deltaLeft = nextSnapTarget.offsetLeft / this.availableContentWidth
      const padding = (0.05 * this.availableContentWidth) / this.availableContentWidth

      console.log(nextSnapTarget, nextSnapTarget.offsetLeft, deltaLeft, deltaRight)

      this.scrollBy(Math.min(deltaLeft, deltaRight + padding));
      return;
    }

    this.state.scrollOffset = clamp(this.state.scrollOffset + 0.1, {
      min: 0,
      max: 1,
    });
  }

  scrollPrevious() {
    const previousSnapTarget = Array.from(this.$$snapTargets)
      .reverse()
      .find((target) => {
        return target.offsetLeft < 0;
      });

    if (previousSnapTarget) {
      this.scrollBy(
        (previousSnapTarget.offsetLeft - this.SNAP_PADDING) /
          this.availableContentWidth
      );
      return;
    }

    this.state.scrollOffset = clamp(this.state.scrollOffset - 0.1, {
      min: 0,
      max: 1,
    });
  }

  scrollBy(delta) {
    this.state.scrollOffset = clamp(this.state.scrollOffset + delta, {
      min: 0,
      max: 1,
    });
  }

  scrollTo(position) {
    this.state.scrollOffset = clamp(position, {
      min: 0,
      max: 1,
    });
  }

  endScroll() {
    this.state.scrollType = null;
    this.values.pageX = null;
    this.values.direction = 0;
  }

  // --- Mouse Wheel Events --- //

  onMouseWheel({ shiftKey, deltaY }) {
    // Only accept wheel events if the user is trying to scroll horizontally
    if (!shiftKey) return;

    this.scrollBy(deltaY / this.availableContentWidth);
  }

  // --- Scroll Content Events --- //

  onContentMouseDown(event) {
    event.preventDefault();
    this.state.scrollType = "content";
  }

  onContentTouchStart(event) {
    event.preventDefault();
    this.state.scrollType = "touch";
  }

  onContentKeyDown({ key }) {
    switch (key) {
      case "ArrowRight":
        this.scrollNext();
        break;
      case "ArrowLeft":
        this.scrollPrevious();
        break;
    }
  }

  onContentFocusChange({ currentTarget, target }) {
    if (target === currentTarget) return;

    const targetRight = target.offsetLeft + target.offsetWidth;
    const viewportRight = this.$viewport.clientWidth;

    if (target.offsetLeft < 0) {
      this.scrollBy(
        (target.offsetLeft - this.SNAP_PADDING) / this.availableContentWidth
      );
      return;
    }
    if (targetRight > viewportRight) {
      this.scrollBy(
        (targetRight - viewportRight + this.SNAP_PADDING) /
          this.availableContentWidth
      );
      return;
    }
  }

  // --- Scroll Track Events --- //

  onTrackMouseDown({ pageX }) {
    const relativeOffset = pageX - this.$track.offsetLeft;
    const thumbCenter = this.$thumb.clientWidth / 2;

    this.scrollTo((relativeOffset - thumbCenter) / this.availableTrackWidth);

    // Manually set pageX to start dragging from the new thumb position (set above)
    this.state.scrollType = "scrollbar";
    this.values.pageX = pageX;
  }

  onThumbMouseDown(event) {
    event.stopPropagation();
    this.state.scrollType = "scrollbar";
  }

  // --- Button Events --- //

  onBackButtonClick() {
    this.scrollPrevious();
  }

  onForwardButtonClick() {
    this.scrollNext();
  }

  // --- Window events --- //

  onWindowResize() {
    const percentVisible =
      this.$viewport.clientWidth / this.$content.scrollWidth;

    this.state.thumbWidth = this.$track.clientWidth * percentVisible;
  }

  onWindowMouseMove(event) {
    if (this.state.scrollType === null) return;

    // If buttons is 0, we probably didn't catch a mouseup event somewhere
    // (eg if it happened outside the viewport)
    if (event.buttons === 0) {
      this.endScroll();
      return;
    }

    event.preventDefault();
    const delta = event.pageX - (this.values.pageX ?? event.pageX);

    switch (this.state.scrollType) {
      case "content":
        this.scrollBy((-1 * delta) / this.availableContentWidth);
        break;
      case "scrollbar":
        this.scrollBy(delta / this.availableTrackWidth);
        break;
    }

    this.values.pageX = event.pageX;
    this.values.direction = (-1 * delta) / Math.abs(delta);
  }

  onWindowClick(event) {
    // If the user has not interacted with the component, do nothing
    if (this.state.scrollType === null && this.values.pageX === null) return;

    // Has a scroll been initiated AND has the mouse moved since then
    if (this.state.scrollType !== null && this.values.pageX !== null)
      event.preventDefault();

    console.log(this.values.direction);
    if (this.values.direction < 0) {
      this.scrollPrevious();
    }
    if (this.values.direction > 0) {
      this.scrollNext();
    }
    this.endScroll();
  }

  onWindowTouchMove({ touches }) {
    if (this.state.scrollType === null) return;

    const activeTouch = touches[0];

    const lastPageX = this.values.pageX ?? activeTouch.pageX;
    const delta = lastPageX - activeTouch.pageX;

    this.scrollBy(delta / this.availableContentWidth);

    this.values.pageX = activeTouch.pageX;
  }

  onWindowTouchEnd() {
    this.endScroll();
  }

  onStateUpdate(_, updatedProp, updatedValue) {
    if (updatedProp !== "scrollOffset") return;

    const nearRadius = 5; // px

    const isStart = this.state.scrollOffset === 0;
    const isEnd = this.state.scrollOffset === 1;

    // Compute px values from percentage offsets
    const contentOffset = this.state.scrollOffset * this.availableContentWidth;

    // If a scroll event would place the scrollbar close the either end, update
    // the state to exactly equal the end
    const isNearStart = !isStart && contentOffset < nearRadius;
    const isNearEnd =
      !isEnd && contentOffset > this.availableContentWidth - nearRadius;

    return {
      scrollOffset: isNearStart
        ? 0
        : isNearEnd
        ? 1
        : roundDecimal(updatedValue, { precision: this.EPSILON }),
    };
  }

  // TODO: Add snap to child
  render(updatedState) {
    const isStart = this.state.scrollOffset === 0;
    const isEnd = this.state.scrollOffset === 1;
    const progress = roundDecimal(this.state.scrollOffset * 100);

    // Compute px values from percentage offsets
    const thumbOffset = this.state.scrollOffset * this.availableTrackWidth;
    const contentOffset = this.state.scrollOffset * this.availableContentWidth;

    switch (this.state.scrollType) {
      case "touch":
        document.body.style.overscrollBehaviorX = "none";
        document.documentElement.style.overscrollBehaviorX = "none";
        break;

      case "content":
        document.body.style.userSelect = "none";
        document.body.style.cursor = "pointer";
        break;

      case "scrollbar":
        document.body.style.userSelect = "none";
        document.body.style.cursor = "pointer";
        this.$track.classList.add(ScrollContainer.classes.active);
        break;

      default:
        this.$track.classList.remove(ScrollContainer.classes.active);
        document.documentElement.style.overscrollBehaviorX = "";
        document.body.style.overscrollBehaviorX = "";
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
    }

    // Update element attributes
    this.$content.style.marginLeft = `-${contentOffset}px`;

    this.$controls.setAttribute("aria-valuenow", progress);

    this.$thumb.style.marginLeft = `${thumbOffset}px`;
    this.$thumb.style.width = `${this.state.thumbWidth}px`;

    this.$component.classList.toggle(
      ScrollContainer.classes.scrollStart,
      isStart
    );
    this.$component.classList.toggle(ScrollContainer.classes.scrollEnd, isEnd);

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

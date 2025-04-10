import { clamp, roundWithPrecision as roundDecimal } from "../utils/math";
import { getBreakpoint, BREAKPOINTS } from "../utils/breakpoints";
import { BaseComponent } from "../utils/BaseComponent";

const absoluteAngle = (x, y) => {
  return (180 * Math.atan(Math.abs(x) / Math.abs(y))) / Math.PI;
};

export class ScrollContainer extends BaseComponent {
  EPSILON = 5; // Decimal places
  SNAP_PADDING = 0.05; // Percent (of viewport width)
  SCROLL_SPEED = 1.5;
  MAXIMUM_VERTICAL_SCROLL = 55; // degrees

  static name = "ScrollContainer";

  static classes = {
    active: "active",
    scrollStart: "scroll-start",
    scrollEnd: "scroll-end",
  };

  constructor(name, element) {
    super(name, element);

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
      wheel: this.onContentMouseWheel,
      mousedown: this.onContentMouseDown,
      touchstart: this.onContentTouchStart,
      keydown: this.onContentKeyDown,
      focusin: this.onContentFocusChange,
    });

    this.bindEvents(this.$track, {
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

  get $viewport() {
    return this.getElement("viewport");
  }

  renderViewport(state) {
    // No changes...
  }

  get $content() {
    return this.getElement("content");
  }

  renderContent() {
    const contentOffset = this.state.scrollOffset * this.availableContentWidth;

    this.$content.style.marginLeft = `-${contentOffset}px`;
  }

  get $controls() {
    return this.getElement("controls");
  }

  renderControls() {
    const progress = roundDecimal(this.state.scrollOffset * 100);

    this.$controls.setAttribute("aria-valuenow", progress);
  }

  get $track() {
    return this.getElement("track");
  }

  renderTrack() {
    if (this.state.dragType === "scrollbar") {
      this.$track.classList.add(ScrollContainer.classes.active);
    } else {
      this.$track.classList.remove(ScrollContainer.classes.active);
    }
  }

  get $thumb() {
    return this.getElement("thumb");
  }

  renderThumb() {
    const thumbOffset = this.state.scrollOffset * this.availableTrackWidth;

    this.$thumb.style.marginLeft = `${thumbOffset}px`;
    this.$thumb.style.width = `${this.state.thumbWidth}px`;
  }

  get $backButton() {
    return this.getElement("backButton");
  }

  renderBackButton() {
    this.$backButton.toggleAttribute("disabled", this.state.scrollOffset === 0);
  }

  get $forwardButton() {
    return this.getElement("forwardButton");
  }

  renderForwardButton() {
    this.$forwardButton.toggleAttribute(
      "disabled",
      this.state.scrollOffset === 1
    );
  }

  get $$snapTargets() {
    return this.$element.querySelectorAll("[data-snap]");
  }

  initialState() {
    return {
      scrollOffset: 0,
      thumbWidth: 0,
      dragType: null, // 'content' | 'scrollbar' | 'touch'
    };
  }

  values = {
    pageX: null,
    dragDirection: 0,
    isTouchEnabled: true,
    lastTouch: null,
  };

  get availableContentWidth() {
    return this.$content.scrollWidth - this.$viewport.clientWidth;
  }

  get availableTrackWidth() {
    return this.$track.clientWidth - this.$thumb.clientWidth;
  }

  // Actions
  animateScroll(delta, initial) {
    if (Math.abs(delta) < 1) return;

    const progress = delta / (initial ?? delta);
    const direction = Math.sign(delta);

    // CREDIT: https://easings.net
    const easedSpeed =
      direction *
      (Math.pow(1 - progress, 3) + Math.pow(progress + this.SCROLL_SPEED, 3));

    if (Math.abs(easedSpeed) >= Math.abs(delta)) {
      this.scrollBy(delta / this.availableContentWidth);
      return;
    }

    this.scrollBy(easedSpeed / this.availableContentWidth);
    requestAnimationFrame(() => this.animateScroll(delta - easedSpeed, delta));
  }

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

      const delta = targetRight - viewportRight;
      const padding = this.SNAP_PADDING * this.$viewport.clientWidth;

      requestAnimationFrame(() => this.animateScroll(delta + padding));
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
      const delta = previousSnapTarget.offsetLeft;
      const padding = this.SNAP_PADDING * this.$viewport.clientWidth;

      requestAnimationFrame(() => this.animateScroll(delta - padding));
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
    this.state.dragType = null;
    this.values.dragDirection = 0;
    this.values.isTouchEnabled = true;
    this.values.pageX = null;
    this.values.lastTouch = null;
  }

  // --- Mouse Wheel Events --- //

  onContentMouseWheel({ shiftKey, deltaY }) {
    // Only accept wheel events if the user is trying to scroll horizontally
    if (!shiftKey) return;

    this.scrollBy(deltaY / this.availableContentWidth);
  }

  // --- Scroll Content Events --- //

  onContentMouseDown(event) {
    event.preventDefault();
    this.state.dragType = "content";
  }

  onContentTouchStart(event) {
    const activeTouch = event.touches[0];

    this.values.lastTouch = {
      pageX: activeTouch.pageX,
      pageY: activeTouch.pageY,
    };
    this.state.dragType = "touch";
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
    const padding = this.SNAP_PADDING * this.$viewport.clientWidth;

    if (target.offsetLeft < 0) {
      const delta = target.offsetLeft;

      this.scrollBy((delta - padding) / this.availableContentWidth);
      return;
    }

    if (targetRight > viewportRight) {
      const delta = targetRight - viewportRight;

      this.scrollBy((delta + padding) / this.availableContentWidth);
      return;
    }
  }

  // --- Scroll Track Events --- //

  onTrackMouseDown({ pageX }) {
    if (BREAKPOINTS[getBreakpoint()] < BREAKPOINTS.desktop) return;

    const relativeOffset = pageX - this.$track.offsetLeft;
    const thumbCenter = this.$thumb.clientWidth / 2;

    this.scrollTo((relativeOffset - thumbCenter) / this.availableTrackWidth);

    // Manually set pageX to start dragging from the new thumb position (set above)
    this.state.dragType = "scrollbar";
    this.values.pageX = pageX;
  }

  onThumbMouseDown(event) {
    if (BREAKPOINTS[getBreakpoint()] < BREAKPOINTS.desktop) return;

    event.stopPropagation();
    this.state.dragType = "scrollbar";
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
    if (this.state.dragType === null) return;

    // If buttons is 0, we probably didn't catch a mouseup event somewhere
    // (eg if it happened outside the viewport)
    if (event.buttons === 0) {
      this.endScroll();
      return;
    }

    event.preventDefault();
    const delta = event.pageX - (this.values.pageX ?? event.pageX);

    switch (this.state.dragType) {
      case "content":
        this.values.dragDirection = -1 * Math.sign(delta);
        this.scrollBy((-1 * delta) / this.availableContentWidth);
        break;
      case "scrollbar":
        this.values.dragDirection = Math.sign(delta);
        this.scrollBy(delta / this.availableTrackWidth);
        break;
    }

    this.values.pageX = event.pageX;
  }

  onWindowClick(event) {
    // If the user has not interacted with the component, do nothing
    if (this.state.dragType === null && this.values.pageX === null) return;

    // Has a scroll been initiated AND has the mouse moved since then
    if (this.state.dragType !== null && this.values.pageX !== null)
      event.preventDefault();

    if (this.values.dragDirection < 1) {
      this.scrollPrevious();
    } else {
      this.scrollNext();
    }

    this.endScroll();
  }

  onWindowTouchMove(event) {
    if (this.state.dragType === null) return;
    if (!this.values.isTouchEnabled) return;

    const { touches } = event;
    const activeTouch = touches[0];

    // Check if user is trying to scroll vertically past container, or horizontally within it
    if (this.values.lastTouch) {
      const { pageX: currentPageX, pageY: currentPageY } = activeTouch;

      const touchAngle = absoluteAngle(
        currentPageX - this.values.lastTouch.pageX,
        currentPageY - this.values.lastTouch.pageY
      );

      // We only need to check touch direction on the first event
      this.values.lastTouch = null;

      if (touchAngle < this.MAXIMUM_VERTICAL_SCROLL) {
        this.values.isTouchEnabled = false;
        this.values.lastTouch = null;
        this.endScroll();
        return;
      }
    }

    const lastPageX = this.values.pageX ?? activeTouch.pageX;
    const delta = lastPageX - activeTouch.pageX;

    this.scrollBy(delta / this.availableContentWidth);

    this.values.pageX = activeTouch.pageX;
    this.values.dragDirection = Math.sign(delta);
  }

  onWindowTouchEnd() {
    if (this.state.dragType === null) return;

    if (this.values.dragDirection < 1) {
      this.scrollPrevious();
    } else {
      this.scrollNext();
    }

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

  render() {
    switch (this.state.dragType) {
      case "touch":
        document.body.style.overscrollBehaviorX = "none";
        document.documentElement.style.overscrollBehaviorX = "none";
        document.documentElement.style.overflowY = "hidden";
        break;

      case "content":
        document.body.style.userSelect = "none";
        document.body.style.cursor = "pointer";
        break;

      case "scrollbar":
        document.body.style.userSelect = "none";
        document.body.style.cursor = "pointer";
        break;

      default:
        document.documentElement.style.overscrollBehaviorX = "";
        document.documentElement.style.overflowY = "";
        document.body.style.overscrollBehaviorX = "";
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
    }

    // Update element attributes
    this.$element.classList.toggle(
      ScrollContainer.classes.scrollStart,
      this.state.scrollOffset === 0
    );

    this.$element.classList.toggle(
      ScrollContainer.classes.scrollEnd,
      this.state.scrollOffset === 1
    );

    this.renderViewport();
    this.renderContent();
    this.renderControls();
    this.renderTrack();
    this.renderThumb();
    this.renderForwardButton();
    this.renderBackButton();
  }
}

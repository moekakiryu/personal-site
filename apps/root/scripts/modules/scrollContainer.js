import { clamp, roundWithPrecision as roundDecimal } from "../utils/math";
import { getBreakpoint, BREAKPOINTS } from "../utils/breakpoints";
import { BaseComponent } from "../utils/BaseComponent";

const absoluteAngle = (x, y) => {
  return (180 * Math.atan(Math.abs(x) / Math.abs(y))) / Math.PI;
};

const FRICTION = 1.06;

export class ScrollContainer extends BaseComponent {
  EPSILON = 5; // Decimal places
  SNAP_PADDING = 0.05; // Percent (of viewport width)
  SCROLL_SPEED = 1.5;
  MAXIMUM_VERTICAL_SCROLL = 55; // degrees

  static name = "ScrollContainer";

  static classes = {
    active: "active",
    disabled: "disabled",
    positionStart: "position-start",
    positionEnd: "position-end",
  };

  constructor(name, element) {
    super(name, element);

    this.onWindowResize();

    this.bindEvents(window, {
      resize: this.onWindowResize,
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
      keydown: this.onContentKeyDown,
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
      isEnabled: true,
      scrollOffset: 0,
      thumbWidth: 0,
      dragType: null, // 'content' | 'scrollbar' | 'touch'
    };
  }

  values = {
    pendingDragType: null,
    momentum: 0,
    lastInteraction: null,
    dragDirection: 0,
    boundListeners: [],
  };

  get $viewport() {
    return this.getElement("viewport");
  }

  get $content() {
    return this.getElement("content");
  }

  get $controls() {
    return this.getElement("controls");
  }

  get $track() {
    return this.getElement("track");
  }

  get $thumb() {
    return this.getElement("thumb");
  }

  get $backButton() {
    return this.getElement("backButton");
  }

  get $forwardButton() {
    return this.getElement("forwardButton");
  }

  get $$snapTargets() {
    return this.$element.querySelectorAll("[data-snap]");
  }

  get availableContentWidth() {
    return this.$content.scrollWidth - this.$viewport.clientWidth;
  }

  get availableTrackWidth() {
    return this.$track.clientWidth - this.$thumb.clientWidth;
  }

  // --- Actions --- //
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
    requestAnimationFrame(() => {
      this.animateScroll(delta - easedSpeed, delta);
    });
  }

  animateMomentum() {
    if (Math.abs(this.values.momentum) < 1) {
      this.values.momentum = 0;
      return;
    }

    const movement = Math.min(this.values.momentum, 15) / FRICTION;
    this.values.momentum = movement;

    this.scrollBy(
      (this.values.dragDirection * Math.abs(movement)) /
        this.availableContentWidth
    );
    requestAnimationFrame(() => {
      this.animateMomentum();
    });
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

      this.animateScroll(delta + padding);
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

      this.animateScroll(delta - padding);
      return;
    }

    this.state.scrollOffset = clamp(this.state.scrollOffset - 0.1, {
      min: 0,
      max: 1,
    });
  }

  snapToNearest() {
    if (this.values.dragDirection < 1) {
      this.scrollPrevious();
    } else {
      this.scrollNext();
    }
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

    this.values.pendingDragType = null;
    this.values.lastInteraction = null;

    // Remove any event listeners that may have been dynamically added
    this.values.boundListeners.forEach((listener) => listener.remove());
    this.values.boundListeners = [];
  }

  addRemovableListener(target, eventType, listener) {
    const boundListener = listener.bind(this);

    target.addEventListener(eventType, boundListener);
    this.values.boundListeners.push({
      remove: () => target.removeEventListener(eventType, boundListener),
    });

    return boundListener;
  }

  // --- Mouse Events --- //

  onContentMouseWheel({ shiftKey, deltaY }) {
    // Only accept wheel events if the user is trying to scroll horizontally
    if (!shiftKey) return;

    this.scrollBy(deltaY / this.availableContentWidth);
  }

  onContentMouseDown(event) {
    event.preventDefault();

    this.values.pendingDragType = "content";
    this.values.lastInteraction = {
      pageX: event.pageX,
      pageY: event.pageY,
    };

    this.addRemovableListener(window, "mousemove", this.onWindowMouseMove);
  }

  onContentTouchStart(event) {
    const activeTouch = event.touches[0];

    this.values.pendingDragType = "touch";
    this.values.lastInteraction = {
      x: activeTouch.pageX,
      y: activeTouch.pageY,
    };

    this.addRemovableListener(window, "touchmove", this.onWindowTouchMove);
  }

  onTrackMouseDown({ pageX, pageY }) {
    if (BREAKPOINTS[getBreakpoint()] < BREAKPOINTS.desktop) return;

    const relativeOffset = pageX - this.$track.offsetLeft;
    const thumbCenter = this.$thumb.clientWidth / 2;

    this.scrollTo((relativeOffset - thumbCenter) / this.availableTrackWidth);

    // Manually set pageX to start dragging from the new thumb position (set above)
    this.values.pendingDragType = "scrollbar";
    this.values.lastInteraction = { x: pageX, y: pageY };

    this.addRemovableListener(window, "mousemove", this.onWindowMouseMove);
  }

  onThumbMouseDown(event) {
    if (BREAKPOINTS[getBreakpoint()] < BREAKPOINTS.desktop) return;

    event.stopPropagation();

    this.values.pendingDragType = "scrollbar";
    this.values.lastInteraction = { x: event.pageX, y: event.pageY };

    this.addRemovableListener(window, "mousemove", this.onWindowMouseMove);
  }

  // --- Accessibility Events --- //

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

    if (percentVisible === 1) {
      this.state.isEnabled = false;
    } else if (!this.state.isEnabled) {
      this.state.isEnabled = true;
    }

    this.state.thumbWidth = this.$track.clientWidth * percentVisible;
  }

  onWindowMouseMove(event) {
    // If buttons is 0, we probably didn't catch a mouseup event somewhere
    // (eg if it happened outside the viewport)
    if (event.buttons === 0) {
      this.endScroll();
      return;
    }
    event.preventDefault();

    if (!this.state.dragType) {
      this.addRemovableListener(window, "click", this.onWindowClick);
      this.state.dragType = this.values.pendingDragType;
    }

    const delta = event.pageX - (this.values.lastInteraction?.x ?? event.pageX);
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
    this.values.lastInteraction = { x: event.pageX, y: event.pageY };
    this.values.momentum =
      this.values.momentum === 0
        ? Math.abs(event.movementX)
        : (Math.abs(event.movementX) + this.values.momentum) / 2;
  }

  // Use onClick instead of onMouseUp to let us catch and stop accidental
  // link clicks
  onWindowClick(event) {
    event.preventDefault();

    this.animateMomentum();
    this.endScroll();
  }

  onWindowTouchMove(event) {
    const { touches } = event;
    const activeTouch = touches[0];

    // Check if user is trying to scroll vertically past container, or
    // horizontally within it
    if (this.state.dragType === null) {
      const { pageX: currentPageX, pageY: currentPageY } = activeTouch;

      const touchAngle = absoluteAngle(
        currentPageX - this.values.lastInteraction.x,
        currentPageY - this.values.lastInteraction.y
      );

      if (touchAngle < this.MAXIMUM_VERTICAL_SCROLL) {
        this.endScroll();
        return;
      }

      this.state.dragType = this.values.pendingDragType;
      this.addRemovableListener(window, "touchend", this.onWindowTouchEnd);
    }

    const lastPageX = this.values.lastInteraction?.x ?? activeTouch.pageX;
    const delta = lastPageX - activeTouch.pageX;

    this.scrollBy(delta / this.availableContentWidth);

    this.values.lastInteraction = {
      x: activeTouch.pageX,
      y: activeTouch.pageY,
    };
    this.values.momentum =
      this.values.momentum === 0
        ? Math.abs(delta)
        : (Math.abs(delta) + this.values.momentum) / 2;
    // this.values.momentum = Math.max(Math.abs(delta), this.values.momentum);
    this.values.dragDirection = Math.sign(delta);
  }

  onWindowTouchEnd() {
    this.animateMomentum();
    this.endScroll();
  }

  render(_, prop) {
    const thumbOffset = this.state.scrollOffset * this.availableTrackWidth;
    const progress = roundDecimal(this.state.scrollOffset * 100);

    const contentOffset = this.state.scrollOffset * this.availableContentWidth;

    switch (prop) {
      case "isEnabled":
        this.$viewport.classList.toggle(
          ScrollContainer.classes.disabled,
          !this.state.isEnabled
        );
        this.$controls.classList.toggle(
          ScrollContainer.classes.disabled,
          !this.state.isEnabled
        );
        break;

      case "scrollOffset":
        this.$content.style.marginLeft = `-${contentOffset}px`;
        this.$thumb.style.marginLeft = `${thumbOffset}px`;
        this.$thumb.ariaValueNow = progress;

        this.$backButton.toggleAttribute(
          "disabled",
          this.state.scrollOffset === 0
        );
        this.$forwardButton.toggleAttribute(
          "disabled",
          this.state.scrollOffset === 1
        );

        this.$element.classList.toggle(
          ScrollContainer.classes.positionStart,
          this.state.scrollOffset === 0
        );
    
        this.$element.classList.toggle(
          ScrollContainer.classes.positionEnd,
          this.state.scrollOffset === 1
        );
        break;

      case "dragType":
        // Do nothing... handled below
        break;

      case "thumbWidth":
        this.$thumb.style.width = `${this.state.thumbWidth}px`;
        break;
    }

    if (prop === 'dragType') {
      if (this.state.dragType === "scrollbar") {
        this.$track.classList.add(ScrollContainer.classes.active);
      } else {
        this.$track.classList.remove(ScrollContainer.classes.active);
      }
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
    }
  }
}

import { Stateful } from "../utils/stateful";
import { responsiveValue } from "../utils/breakpoints";
import { roundWithPrecision } from "../utils/math";

export class ResumeTimeline extends Stateful {
  DOT_OFFSET = 18; // px

  static elements = {
    component: "js-timeline",
    contract: "js-contract",
    floatingTitle: "js-floating-title",
    line: "js-line",
    fill: "js-fill",
  };

  static classes = {
    passed: "passed",
    floating: "floating",
  };

  get revealHeight() {
    return responsiveValue(130, { large: 350 }); // px
  }

  get $$contracts() {
    return this.$component.querySelectorAll(
      `.${ResumeTimeline.elements.contract}`
    );
  }

  get $$floatingTitles() {
    return this.$component.querySelectorAll(
      `.${ResumeTimeline.elements.floatingTitle}`
    );
  }

  get $$lines() {
    return this.$component.querySelectorAll(`.${ResumeTimeline.elements.line}`);
  }

  $fill(line) {
    return line.querySelector(`.${ResumeTimeline.elements.fill}`);
  }

  constructor(component) {
    super();
    this.$component = component;

    this.bindEvents(window, {
      resize: this.onScroll,
    });

    this.bindEvents(document, {
      scroll: this.onScroll,
    });
  }

  getClipHeight(target) {
    const boundingRect = target.getBoundingClientRect();

    const offset = this.revealHeight - boundingRect.y;
    const asPercent = (offset * 100) / boundingRect.height;

    return roundWithPrecision(asPercent);
  }

  setTimelineProgress() {
    this.$$lines.forEach((line) => {
      const fill = this.$fill(line);
      const clipHeight = this.getClipHeight(line);

      requestAnimationFrame(() => {
        fill.style.clipPath = `inset(${clipHeight}% 0 0 0)`;
      });
    });
  }

  fillTimelineDots() {
    this.$$contracts.forEach((contract) => {
      if (
        contract.getBoundingClientRect().y <=
        this.revealHeight - this.DOT_OFFSET
      ) {
        contract.classList.add(ResumeTimeline.classes.passed);
      } else {
        contract.classList.remove(ResumeTimeline.classes.passed);
      }
    });
  }

  addFloatingShadow() {
    this.$$floatingTitles.forEach((floatingTitle) => {
      const titleParent = floatingTitle.parentElement;

      const parentBottom = titleParent.offsetTop + titleParent.offsetHeight;
      const floatingBottom =
        floatingTitle.offsetTop + floatingTitle.offsetHeight;

      // Compare against 5px to allow for any minor differences with border
      // TODO: Fix CSS so this isn't necessary
      const isTop = floatingTitle.offsetTop === titleParent.offsetTop;
      const isBottom = parentBottom - floatingBottom < 5;

      if (!isTop && !isBottom) {
        floatingTitle.classList.add(ResumeTimeline.classes.floating);
      } else {
        floatingTitle.classList.remove(ResumeTimeline.classes.floating);
      }
    });
  }

  onScroll() {
    this.setTimelineProgress();
    this.fillTimelineDots();
    this.addFloatingShadow();
  }

  static mount() {
    const components = document.querySelectorAll(`.${this.elements.component}`);

    components.forEach((component) => {
      new this(component);
    });
  }
}

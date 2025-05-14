import { BaseComponent } from "../utils/BaseComponent";
import { responsiveValue } from "../utils/breakpoints";
import { roundWithPrecision } from "../utils/math";

export class ResumeTimeline extends BaseComponent {
  static name = "ResumeTimeline";

  static classes = {
    passed: "passed",
    floating: "floating",
  };

  constructor(name, element) {
    super(name, element);

    this.bindEvents(window, {
      resize: this.onScroll,
    });

    this.bindEvents(document, {
      scroll: this.onScroll,
    });
  }

  get revealHeight() {
    return responsiveValue(100, { desktop: 160 }); // px
  }

  get $$contracts() {
    return this.getElements("contract");
  }

  get $$floatingTitles() {
    return this.getElements("floatingTitle");
  }

  get $$lines() {
    return this.getElements("line");
  }

  $fill(line) {
    return this.getElement("fill", { parent: line });
  }

  getDotOffset(target) {
    return responsiveValue(0.5 * target.offsetHeight, { desktop: 18 });
  }

  getClipHeight(target) {
    const boundingRect = target.getBoundingClientRect();

    const offset = this.revealHeight - boundingRect.y;
    const asPercent = (offset * 100) / boundingRect.height;

    return roundWithPrecision(asPercent);
  }

  setTimelineProgress() {
    this.$$lines.forEach((line) => {
      const $fill = this.$fill(line);
      const clipHeight = this.getClipHeight(line);

      requestAnimationFrame(() => {
        $fill.style.clipPath = `inset(${clipHeight}% 0 0 0)`;
      });
    });
  }

  fillTimelineDots() {
    this.$$contracts.forEach((contract) => {
      if (
        contract.getBoundingClientRect().y <=
        this.revealHeight - this.getDotOffset(contract)
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

      floatingTitle.classList.toggle(
        ResumeTimeline.classes.floating,
        !isTop && !isBottom
      );
    });
  }

  onScroll() {
    this.setTimelineProgress();
    this.fillTimelineDots();
    this.addFloatingShadow();
  }
}

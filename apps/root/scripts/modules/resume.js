import { BaseComponent } from "../utils/BaseComponent";
import { responsiveValue } from "../utils/breakpoints";
import { roundWithPrecision } from "../utils/math";

export class ResumeTimeline extends BaseComponent {
  DOT_OFFSET = 18; // px

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
    return responsiveValue(130, { large: 350 }); // px
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
}

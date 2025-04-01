import { Stateful } from './utils/stateful'
import { responsiveValue } from './utils/breakpoints'
import { roundWithPrecision } from './utils/math'

export class ResumeTimeline extends Stateful {
  DOT_OFFSET = 18; // px

  elements = {
    contract: "js-contract",
    floatingTitle: "js-floating-title",
    line: "js-line",
    fill: "js-fill",
  };

  classes = {
    passed: "passed",
    floating: "floating",
  };

  static = {
    activeAnimations: [],
  };

  get revealHeight() {
    return responsiveValue(130, { large: 350 }); // px
  }

  get $contract() {
    return document.querySelectorAll(`.${this.elements.contract}`);
  }

  get $floatingTitle() {
    return document.querySelectorAll(`.${this.elements.floatingTitle}`);
  }

  get $line() {
    return document.querySelectorAll(`.${this.elements.line}`);
  }

  $fill(line) {
    return line.querySelector(`.${this.elements.fill}`);
  }

  getClipHeight(target) {
    const boundingRect = target.getBoundingClientRect();

    const offset = this.revealHeight - boundingRect.y;
    const asPercent = (offset * 100) / boundingRect.height;

    return roundWithPrecision(asPercent);
  }

  setTimelineProgress() {
    this.$line.forEach((line) => {
      const fill = this.$fill(line);
      const clipHeight = this.getClipHeight(line);
      const animationIndex = this.static.activeAnimations.indexOf(line);

      if (animationIndex < 0) {
        requestAnimationFrame(() => {
          fill.style.clipPath = `inset(${clipHeight}% 0 0 0)`;
          this.static.activeAnimations.splice(animationIndex, 1);
        });

        this.static.activeAnimations.push(line);
      }
    });
  }

  fillTimelineDots() {
    this.$contract.forEach((contract) => {
      if (
        contract.getBoundingClientRect().y <=
        this.revealHeight - this.DOT_OFFSET
      ) {
        contract.classList.add(this.classes.passed);
      } else {
        contract.classList.remove(this.classes.passed);
      }
    });
  }

  addFloatingShadow() {
    this.$floatingTitle.forEach((floatingTitle) => {
      const titleParent = floatingTitle.parentElement;

      const parentBottom = titleParent.offsetTop + titleParent.offsetHeight;
      const floatingBottom =
        floatingTitle.offsetTop + floatingTitle.offsetHeight;

      // Compare against 5px to allow for any minor differences with border
      // TODO: Fix CSS so this isn't necessary
      const isTop = floatingTitle.offsetTop === titleParent.offsetTop;
      const isBottom = parentBottom - floatingBottom < 5;

      if (!isTop && !isBottom) {
        floatingTitle.classList.add(this.classes.floating);
      } else {
        floatingTitle.classList.remove(this.classes.floating);
      }
    });
  }

  onScroll() {
    this.setTimelineProgress();
    this.fillTimelineDots();
    this.addFloatingShadow();
  }

  mount() {
    window.addEventListener("resize", this.onScroll.bind(this));
    document.addEventListener("scroll", this.onScroll.bind(this));
  }
}
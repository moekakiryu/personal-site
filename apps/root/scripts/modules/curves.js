import { BREAKPOINTS, getBreakpoint } from "../utils/breakpoints";
import { createSvgElement } from "../utils/dom";
import { SVGCursor } from "../utils/SVGCursor";

const parameters = {
  // (px) How broad the curve corners should be
  curveRadius: {
    desktop: 40,
    mobile: 25,
  },
  // (px) Offset from the center for the starting point of each curve
  originOffset: -60,
  // (px) Offset from the center for the ending point of each curve
  targetOffset: {
    x: -58,
    y: 18,
  },
  // (seconds) How long the 'flash' duration should take
  animationDuration: {
    desktop: 0.5,
    mobile: 0.5,
  },

  revealHeight: {
    desktop: {
      on: 300,
      off: 400,
    },
    mobile: {
      on: 300,
      off: 400,
    },
  },
};
const firedEvents = []

function buildConnectorPath(start, end, curveRadius) {
  const { x: startX, y: startY } = start;
  const { x: endX, y: endY } = end;

  const fitRadius = Math.min(
    curveRadius,
    Math.min(Math.abs(endX - startX), Math.abs(endY - startY)) / 2
  );

  // Note we need to invert PI since cursor.arc differentiates between
  // -2*PI and 2*PI for calculating the arc flags
  const directionX = startX > endX ? -1 : 1;
  const directionalPi = -1 * directionX * Math.PI;

  const legs = {
    x: endX - startX - directionX * 2 * fitRadius,
    y: endY / 2 - fitRadius,
  };

  const cursor = new SVGCursor();

  // Set start position
  cursor.move({ x: startX, y: startY });
  // Move down
  cursor.line({ y: legs.y });
  // Draw first curve
  cursor.arc(fitRadius, directionalPi / 2, directionalPi);
  // Move horizontally
  cursor.line({ x: legs.x });
  // Draw second curvz
  cursor.arc(fitRadius, 2 * directionalPi, (3 * directionalPi) / 2);
  // Move down
  cursor.line({ y: legs.y });

  return cursor.commands.join(" ");
}

function buildElbowPath(start, end, curveRadius) {
  const { x: startX, y: startY } = start;
  const { x: endX, y: endY } = end;

  const fitRadius = Math.min(
    curveRadius,
    Math.min(Math.abs(endX - startX), Math.abs(endY - startY))
  );

  const legs = {
    x: endX - startX - fitRadius,
    y: endY - fitRadius,
  };

  const cursor = new SVGCursor();

  // Set start position
  cursor.move({ x: startX, y: startY });
  // Move down
  cursor.line({ y: legs.y });
  // Bend right
  cursor.arc(fitRadius, (3 * Math.PI) / 2, Math.PI);
  // Move horizontally
  cursor.line({ x: legs.x });

  return cursor.commands.join(" ");
}

function buildPath(svgElement, target) {
  const isDesktop = BREAKPOINTS[getBreakpoint()] > BREAKPOINTS.tablet;

  const localOffset = {
    x: target.getBoundingClientRect().x - svgElement.getBoundingClientRect().x,
    y: target.getBoundingClientRect().y - svgElement.getBoundingClientRect().y,
  };

  if (isDesktop) {
    const origin = {
      x: svgElement.clientWidth / 2 + parameters.originOffset,
      y: 0,
    };
    const elementCenter = {
      x: localOffset.x + target.offsetWidth / 2 + parameters.targetOffset.x,
      y: svgElement.clientHeight,
    };

    return buildConnectorPath(
      origin,
      elementCenter,
      parameters.curveRadius.desktop
    );
  } else {
    const origin = {
      x: 7,
      y: 0,
    };
    const elementCenter = {
      x: svgElement.clientWidth - 7,
      y: localOffset.y + parameters.targetOffset.y,
    };

    return buildElbowPath(origin, elementCenter, parameters.curveRadius.mobile);
  }
}

function updateSvg(svgElement, targetElements) {
  firedEvents.push('Update')
  const isDesktop = BREAKPOINTS[getBreakpoint()] > BREAKPOINTS.tablet;
  svgElement.replaceChildren();

  const curves = Array.from(targetElements).map((element, elementIndex) => {
    const pathId = `connector${elementIndex}`;
    const animationId = `${pathId}Animation`;

    const path = buildPath(svgElement, element);
    const breakpointParameters = isDesktop
      ? {
          dur: `${parameters.animationDuration.desktop}s`,
        }
      : {
          dur: `${parameters.animationDuration.mobile}s`,
          calcMode: "linear",
        };

    const pathElement = createSvgElement("path", {
      id: pathId,
      d: path,
      class: "line",
    });

    const animationElement = createSvgElement(
      "animateMotion",
      {
        id: animationId,
        fill: "freeze",
        begin: "indefinite",
        ...breakpointParameters,
      },
      undefined,
      // spellchecker: disable-next-line
      createSvgElement("mpath", { href: `#${pathId}` })
    );

    const animationVisibilityElement = createSvgElement("set", {
      attributeName: "visibility",
      to: "visible",
      begin: `${animationId}.begin`,
      end: `${animationId}.end`,
    });

    const circleElement = createSvgElement(
      "circle",
      {
        r: 8,
        class: "circle",
      },
      undefined,
      animationElement,
      animationVisibilityElement
    );

    let hasFired = false;
    const scrollTrigger = isDesktop
      ? svgElement.getBoundingClientRect().y - parameters.revealHeight.desktop.on
      : svgElement.getBoundingClientRect().y - parameters.revealHeight.mobile.on;
    const scrollReset = isDesktop
      ? svgElement.getBoundingClientRect().y - parameters.revealHeight.desktop.off
      : svgElement.getBoundingClientRect().y - parameters.revealHeight.mobile.off;
    const scrollListener = () => {
      document.querySelectorAll('.debug-output').forEach(output => {
        output.innerHTML = `
          <div>hasFired: ${hasFired}, reset: ${window.scrollY < scrollReset}, trigger: ${window.scrollY < scrollTrigger}</div>
          <div>[<br>&nbsp;&nbsp;${firedEvents.join(',<br>&nbsp;&nbsp;')}<br>]</div>
        `
      })
      if (hasFired && window.scrollY < scrollReset) {
        firedEvents.push(`Reset: (${hasFired}, reset: ${window.scrollY < scrollReset}, trigger: ${window.scrollY < scrollTrigger})`)
        hasFired = false;
        return
      }
      if (hasFired || window.scrollY < scrollTrigger) return;

      animationElement.beginElement();
      firedEvents.push(`Main (${hasFired}, reset: ${window.scrollY < scrollReset}, trigger: ${window.scrollY < scrollTrigger})`)
      hasFired = true;
    };
    window.addEventListener("scroll", scrollListener);
    window.addEventListener("resize", () => {
      firedEvents.push('Clear event listeners')
      window.removeEventListener("scroll", scrollListener)
    });

    return { path: pathElement, circle: circleElement };
  });

  curves.reverse().forEach(({ path, circle }) => {
    svgElement.appendChild(path);
    svgElement.appendChild(circle);
  });
}

export function init() {
  const svgElement = document.getElementById("curve-template");
  const targets = document.querySelectorAll(".skills-list > div");

  if (svgElement) {
    updateSvg(svgElement, targets);

    window.addEventListener("resize", () => {
      firedEvents.push('Window resize')
      updateSvg(svgElement, targets);
    });
  }
}

import { BREAKPOINTS, getBreakpoint } from '../utils/breakpoints'
import { createSvgElement } from '../utils/dom'
import { SVGCursor } from '../utils/SVGCursor'

const parameters = {
  curveRadius: 50, // px
  originOffset: -60, // px - How far away from the center the curves should start from
  targetOffset: {
    x: -58,
    y: 18,
  }, // px - How far away from the center the curves should start from
};

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

  // Draw second curve
  cursor.arc(fitRadius, 2 * directionalPi, (3 * directionalPi) / 2);

  // Move down
  cursor.line({ y: legs.y });

  return cursor.commands.join(' ');
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
    y: endY - fitRadius
  }

  const cursor = new SVGCursor();
  
  // Set start position
  cursor.move({ x: startX, y: startY })

  // Move down
  cursor.line({ y: legs.y })

  // Bend right
  cursor.arc(fitRadius, 3 * Math.PI / 2, Math.PI)

  // Move horizontally
  cursor.line({ x: legs.x })

  return cursor.commands.join(' ')
}

function updateSvg(svgElement, targetElements) {
  svgElement.replaceChildren()

  const curves = Array.from(targetElements).map((element) => {
    const localOffset = {
      x: element.getBoundingClientRect().x - svgElement.getBoundingClientRect().x,
      y: element.getBoundingClientRect().y - svgElement.getBoundingClientRect().y
    }

    // // Note we are using the SVG element since the curve will span the full height
    let path
    if (BREAKPOINTS[getBreakpoint()] > BREAKPOINTS.tablet) {
      const origin = {
        x: svgElement.clientWidth / 2 + parameters.originOffset,
        y: 0,
      }
      const elementCenter = {
        x: localOffset.x + element.offsetWidth / 2 + parameters.targetOffset.x,
        y: svgElement.clientHeight
      }

      path = buildConnectorPath(origin, elementCenter, parameters.curveRadius)
    } else {
      const origin = {
        x: 7,
        y: 0,
      }
      const elementCenter = {
        x: svgElement.clientWidth - 7,
        y: localOffset.y + parameters.targetOffset.y,
      }
  
      path = buildElbowPath(origin, elementCenter, 20)
    }

    return {
      path: createSvgElement('path', {
        d: path,
        class: 'line',
        'stroke-linecap': 'round',
      }),
      // circle: createSvgElement('circle', {
      //   cx: elementCenter.x,
      //   cy: elementCenter.y,
      //   r: 6,
      //   class: 'line filled'
      // })
    }
  })

  curves.forEach(({path, circle}) => {
    svgElement.appendChild(path)
    // svgElement.appendChild(circle)
  })
}

export function init() {
  const svgElement = document.getElementById('curve-template')
  const targets = document.querySelectorAll('.skills-list > div')

  if (svgElement) {
    updateSvg(svgElement, targets)

    window.addEventListener('resize', () => {
      updateSvg(svgElement, targets)
    })
  }
}
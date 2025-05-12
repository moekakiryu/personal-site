let currentWidth = window.innerWidth

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 480,
  desktop: 768,
  large: 1280,
};

/**
 * Helper to work with breakpoints
 */
export function getBreakpoint() {
  const screenSize = window.innerWidth;

  const breakpoint = Object.entries(BREAKPOINTS).reduce(
    (breakpoint, [name, size]) => {
      if (size < screenSize) {
        return [name, size];
      }
      return breakpoint;
    }
  );

  return breakpoint[0];
}

/**
 * Accept a mapping of breakpoint names (see `getBreakpoint` above) and return
 * the value corresponding to the current screen size
 * 
 * @TODO: return a dynamic property `.current`
 */
export function responsiveValue(defaultValue, mapping) {
  const currentBreakpoint = getBreakpoint();

  // Find the largest mapped breakpoint smaller than the current breakpoint
  const mappedKey = Object.entries(mapping).reduce((maxKey, [currentKey]) => {
    if (maxKey && BREAKPOINTS[currentKey] <= BREAKPOINTS[maxKey]) {
      return maxKey;
    }
    if (BREAKPOINTS[currentKey] > BREAKPOINTS[currentBreakpoint]) {
      return maxKey;
    }
    return currentKey;
  }, undefined);

  return mappedKey ? mapping[mappedKey] : defaultValue;
}

// This helper is necessary because mobile browsers (most notable FF) also
// fire resize events when the search bar auto-hides and auto-reveals, which we
// want to ignore
export function addScreenWidthListener(listener) {
  let currentWidth = window.innerWidth

  const decoratedListener = (event) => {
    const newWidth = window.innerWidth

    if (currentWidth !== newWidth) {
      currentWidth = newWidth
      listener(event)
    }
  }

  window.addEventListener('resize', decoratedListener)

  return decoratedListener
}
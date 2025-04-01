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

function createElementCreator(creator) {
  return function (tagName, attributes = {}, events = {}) {
    const element = creator(tagName);

    Object.entries(attributes).forEach(([attribute, value]) => {
      element.setAttribute(attribute, value);
    });

    bindEvents(element, events);

    return element;
  };
}

export function bindEvents(element, eventMapping) {
  Object.entries(eventMapping).forEach(([eventType, listener]) => {
    element.addEventListener(eventType, listener);
  });
}

export const createElement = createElementCreator(document.createElement);
export const createSvgElement = createElementCreator((...args) =>
  document.createElementNS("http://www.w3.org/2000/svg", ...args)
);

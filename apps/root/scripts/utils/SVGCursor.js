import { roundWithPrecision } from "../utils/math";

// Poor mans d3
export class SVGCursor {
  #initialLocation = null;
  #currentLocation = null;
  #commands = [];

  constructor() {
    this.#currentLocation = null;
  }

  get commands() {
    return [...this.#commands];
  }

  get currentLocation() {
    return { ...this.#currentLocation };
  }

  #isCurrentLocation({ x, y }) {
    return x === this.#currentLocation?.x && y === this.#currentLocation?.y;
  }

  reset({ resetInitial } = { resetInitial: false }) {
    this.#commands = [];

    if (resetInitial) {
      this.#initialLocation = null;
    }

    this.#currentLocation = { ...this.#initialLocation };
  }

  move({ x, y }) {
    if (this.#isCurrentLocation({ x, y })) {
      return null;
    }

    this.#currentLocation = { x, y };

    if (this.#initialLocation === null) {
      this.#initialLocation = this.#currentLocation;
    }

    return this.#commands.push(`M ${x} ${y}`);
  }

  line({ x, y }) {
    const newLocation = {
      x: this.currentLocation.x + (x ?? 0),
      y: this.currentLocation.y + (y ?? 0),
    };

    if (this.#isCurrentLocation(newLocation)) {
      return null;
    }

    this.#currentLocation = newLocation;

    return this.#commands.push(`L ${newLocation.x} ${newLocation.y}`);
  }

  arc(radius, fromAngle, toAngle) {
    const circleOrigin = {
      x: this.currentLocation.x - radius * Math.sin(fromAngle),
      y: this.currentLocation.y + radius * Math.cos(fromAngle),
    };
    const newLocation = {
      x: roundWithPrecision(circleOrigin.x + radius * Math.sin(toAngle), {
        precision: 4,
      }),
      y: roundWithPrecision(circleOrigin.y - radius * Math.cos(toAngle), {
        precision: 4,
      }),
    };

    if (this.#isCurrentLocation(newLocation)) {
      return null;
    }

    this.#currentLocation = newLocation;

    const sweepFlag = fromAngle > toAngle ? 0 : 1;
    const largeFlag = 0;

    return this.#commands.push(
      `A ${radius} ${radius} 0 ${largeFlag} ${sweepFlag} ${newLocation.x} ${newLocation.y}`
    );
  }
}

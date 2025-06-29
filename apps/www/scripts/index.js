import { Accordion } from './modules/accordion'
import { Navigation } from "./modules/navigation";
import { ResumeTimeline } from "./modules/timeline";
import { ScrollContainer } from './modules/scrollContainer';
import * as curves from './modules/curves'

// Components defined using `BaseComponent`
const mountables = [
  ScrollContainer,
  Navigation,
  ResumeTimeline,
  Accordion,
]

// All other components
const initables = [
  curves
]

document.addEventListener("DOMContentLoaded", () => {
  mountables.forEach(mountable => mountable.mount())
  initables.forEach(initable => initable.init());
});

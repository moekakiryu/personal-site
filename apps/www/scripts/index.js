import { Accordion } from './modules/accordion'
import { Navigation } from "./modules/navigation";
import { ResumeTimeline } from "./modules/timeline";
import { ScrollContainer } from './modules/scrollContainer';
import * as curves from './modules/curves'

const mountables = [
  ScrollContainer,
  Navigation,
  ResumeTimeline,
  Accordion,
]

const initables = [
  curves
]

document.addEventListener("DOMContentLoaded", () => {
  mountables.forEach(mountable => mountable.mount())
  initables.forEach(initable => curves.init());
});

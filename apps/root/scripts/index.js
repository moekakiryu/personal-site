import { Navigation } from "./modules/navigation";
import { ResumeTimeline } from "./modules/resume";
import { ScrollContainer } from './modules/scrollContainer';

const mountables = [
  ScrollContainer,
  Navigation,
  ResumeTimeline,
]

document.addEventListener("DOMContentLoaded", () => {
  mountables.forEach(mountable => mountable.mount())
});

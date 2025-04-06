import { Navigation } from "./modules/navigation";
import { ResumeTimeline } from "./modules/resume";
import { ScrollContainer } from './modules/scrollContainer';

const mountables = [
  // Navigation,
  ResumeTimeline,
]

document.addEventListener("DOMContentLoaded", () => {
  mountables.forEach(mountable => {
    new mountable().mount()
  })
  ScrollContainer.mount()
  Navigation.mount()
});

import { Navigation } from "./navigation";
import { ResumeTimeline } from "./resume";

document.addEventListener("DOMContentLoaded", () => {
  new Navigation().mount();
  new ResumeTimeline().mount();
});

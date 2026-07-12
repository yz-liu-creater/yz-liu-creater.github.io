const root = document.documentElement;
const shell = document.querySelector(".site-shell");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setPointerPosition(event) {
  if (prefersReducedMotion.matches) return;

  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  root.style.setProperty("--mx", x.toFixed(3));
  root.style.setProperty("--my", y.toFixed(3));
}

function handleScroll() {
  if (!shell) return;

  const scrolled = window.scrollY > 8;
  shell.classList.toggle("is-scrolled", scrolled);
}

window.addEventListener("pointermove", setPointerPosition, { passive: true });
window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

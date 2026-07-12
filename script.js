const root = document.documentElement;
const shell = document.querySelector(".site-shell");
const navLinks = Array.from(document.querySelectorAll(".nav-links a[data-nav]"));
const currentPage = document.body.dataset.page || "about";

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

  shell.classList.toggle("is-scrolled", window.scrollY > 8);
}

function setActiveNav(page) {
  navLinks.forEach((link) => link.classList.remove("active"));
  navLinks
    .find((link) => link.dataset.nav === page)
    ?.classList.add("active");
}

window.addEventListener("pointermove", setPointerPosition, { passive: true });
window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();
setActiveNav(currentPage);

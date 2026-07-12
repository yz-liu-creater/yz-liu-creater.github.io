const root = document.documentElement;
const shell = document.querySelector(".site-shell");
const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
const sections = Array.from(document.querySelectorAll("section[id], article[id]"));
const linkById = new Map(
  navLinks.map((link) => [link.getAttribute("href").slice(1), link])
);

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

function setActiveNav(id) {
  navLinks.forEach((link) => link.classList.remove("active"));
  linkById.get(id)?.classList.add("active");
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setActiveNav(visible.target.id);
    },
    {
      rootMargin: "-18% 0px -62% 0px",
      threshold: [0.15, 0.35, 0.6],
    }
  );

  sections.forEach((section) => observer.observe(section));
} else {
  setActiveNav("about");
}

window.addEventListener("pointermove", setPointerPosition, { passive: true });
window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();
setActiveNav("about");

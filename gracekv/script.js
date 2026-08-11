const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-site-nav]");
const navigationLinks = Array.from(document.querySelectorAll("[data-section-link]"));
const citationButtons = Array.from(document.querySelectorAll("[data-copy-citation]"));
const citation = document.querySelector("#bibtex")?.textContent?.trim() || "";

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setMenu(open) {
  if (!menuButton || !navigation) return;

  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  menuButton.setAttribute("title", open ? "Close navigation" : "Open navigation");
  navigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) setMenu(false);
});

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function setCopyState(button, copied) {
  const label = button.querySelector("[data-copy-label]");
  const icon = button.querySelector("use");

  if (label) {
    label.textContent = copied
      ? "Copied"
      : button.closest(".bibtex-header")
        ? "Copy"
        : "Copy BibTeX";
  }

  if (icon) {
    icon.setAttribute("href", copied ? "#icon-check" : "#icon-copy");
  }
}

citationButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (!citation) return;

    try {
      await writeClipboard(citation);
      setCopyState(button, true);
      window.setTimeout(() => setCopyState(button, false), 1800);
    } catch (error) {
      setCopyState(button, false);
    }
  });
});

const sections = navigationLinks
  .map((link) => document.getElementById(link.dataset.sectionLink))
  .filter(Boolean);

function updateActiveSection() {
  let activeSection = null;

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 160) {
      activeSection = section.id;
    }
  });

  navigationLinks.forEach((link) => {
    if (link.dataset.sectionLink === activeSection) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function handleScroll() {
  updateHeader();
  updateActiveSection();
}

window.addEventListener("scroll", handleScroll, { passive: true });
updateHeader();
updateActiveSection();

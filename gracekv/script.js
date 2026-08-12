const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-site-nav]");
const navigationLinks = Array.from(document.querySelectorAll("[data-section-link]"));
const citationButtons = Array.from(document.querySelectorAll("[data-copy-citation]"));
const citation = document.querySelector("#bibtex")?.textContent?.trim() || "";
const isChinese = document.documentElement.lang.toLowerCase().startsWith("zh");
const uiText = isChinese
  ? {
      openNavigation: "打开导航",
      closeNavigation: "关闭导航",
      copied: "已复制",
      copy: "复制",
      copyBibtex: "复制 BibTeX",
    }
  : {
      openNavigation: "Open navigation",
      closeNavigation: "Close navigation",
      copied: "Copied",
      copy: "Copy",
      copyBibtex: "Copy BibTeX",
    };
let menuReturnFocus = null;

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setMenu(open, restoreFocus = true) {
  if (!menuButton || !navigation) return;

  const wasOpen = menuButton.getAttribute("aria-expanded") === "true";

  if (open && !wasOpen) {
    menuReturnFocus = document.activeElement;
  }

  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? uiText.closeNavigation : uiText.openNavigation);
  menuButton.setAttribute("title", open ? uiText.closeNavigation : uiText.openNavigation);
  navigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);

  if (open) {
    navigationLinks[0]?.focus();
  } else if (wasOpen && restoreFocus && menuReturnFocus instanceof HTMLElement) {
    menuReturnFocus.focus();
  }
}

menuButton?.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  setMenu(willOpen, !willOpen);
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false, false));
});

document.addEventListener("keydown", (event) => {
  const menuOpen = menuButton?.getAttribute("aria-expanded") === "true";

  if (event.key === "Escape" && menuOpen) {
    event.preventDefault();
    setMenu(false);
    return;
  }

  if (event.key === "Tab" && menuOpen && window.innerWidth <= 860) {
    const focusable = [menuButton, ...navigationLinks].filter(Boolean);
    const currentIndex = focusable.indexOf(document.activeElement);
    const nextIndex = event.shiftKey
      ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
      : (currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);

    event.preventDefault();
    focusable[nextIndex].focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) setMenu(false, false);
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
      ? uiText.copied
      : button.closest(".bibtex-header")
        ? uiText.copy
        : uiText.copyBibtex;
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

const frontierDemo = document.querySelector("[data-frontier-demo]");
const frontierButtons = Array.from(document.querySelectorAll("[data-frontier-level]"));
const frontierTitle = document.querySelector("[data-frontier-title]");
const frontierCount = document.querySelector("[data-frontier-count]");
const frontierDescription = document.querySelector("[data-frontier-description]");

const frontierStates = isChinese ? {
  0: {
    title: "丢弃：空前沿",
    count: "0 个条目",
    description: "根节点没有被纳入，因此这个层—头组合不会为该语义槽写入任何物理条目。",
  },
  1: {
    title: "有覆盖：一个粗粒度原型",
    count: "1 个条目",
    description: "一个已存储的原型让整个语义槽仍可被访问，但局部 token 细节被合并。",
  },
  3: {
    title: "混合局部分辨率",
    count: "3 个条目",
    description: "三个互不重叠的前沿节点把更多细节分配给关键区域，同时让其余部分保持粗粒度。",
  },
  8: {
    title: "精确：token 级叶节点",
    count: "8 个条目",
    description: "每个叶节点都保存原始 K/V 对；完全展开后可精确恢复未压缩的语义槽。",
  },
} : {
  0: {
    title: "Dropped: empty frontier",
    count: "0 entries",
    description: "No root was admitted, so this slot writes no physical entry for this layer-head pair.",
  },
  1: {
    title: "Coverage: one coarse prototype",
    count: "1 entry",
    description: "One stored prototype keeps the whole slot addressable, but local token detail is merged.",
  },
  3: {
    title: "Mixed local resolution",
    count: "3 entries",
    description: "Three non-overlapping frontier nodes spend more detail on one region while keeping the rest coarse.",
  },
  8: {
    title: "Exact: token-level leaves",
    count: "8 entries",
    description: "Every leaf stores its original K/V pair. Full expansion recovers the uncompressed slot exactly.",
  },
};

function setFrontierLevel(level) {
  const normalizedLevel = String(level);
  const state = frontierStates[normalizedLevel];
  if (!frontierDemo || !state) return;

  frontierDemo.dataset.level = normalizedLevel;
  if (frontierTitle) frontierTitle.textContent = state.title;
  if (frontierCount) frontierCount.textContent = state.count;
  if (frontierDescription) frontierDescription.textContent = state.description;

  frontierButtons.forEach((button) => {
    const selected = button.dataset.frontierLevel === normalizedLevel;
    button.setAttribute("aria-checked", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

frontierButtons.forEach((button) => {
  button.addEventListener("click", () => setFrontierLevel(button.dataset.frontierLevel));
  button.addEventListener("keydown", (event) => {
    const currentIndex = frontierButtons.indexOf(button);
    let nextIndex = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % frontierButtons.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + frontierButtons.length) % frontierButtons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = frontierButtons.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const nextButton = frontierButtons[nextIndex];
    setFrontierLevel(nextButton.dataset.frontierLevel);
    nextButton.focus();
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

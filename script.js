const root = document.documentElement;
const shell = document.querySelector(".site-shell");
const navLinks = Array.from(document.querySelectorAll(".nav-links a[data-nav]"));
const languageButtons = Array.from(document.querySelectorAll(".lang-option[data-lang]"));
const translatableNodes = Array.from(document.querySelectorAll("[data-i18n]"));
const metaDescription = document.querySelector('meta[name="description"]');
const currentPage = document.body.dataset.page || "about";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const languageStorageKey = "yuzhe-site-language";
const supportedLanguages = ["en", "zh"];

const translations = {
  en: {
    "nav.about": "About",
    "nav.researchs": "Researchs",
    "nav.projects": "Projects",
    "nav.blogs": "Blogs",
    "nav.contact": "Contact",
    "action.email": "Email",
    "home.eyebrow": "Tsinghua University",
    "home.headline": "Computer Science and Finance dual-degree undergraduate at Tsinghua University. Researching LLMs and Transformers at THU College AI ΔI Lab.",
    "home.muted": "Exploring large-scale models, model quantization, and the intersection of intelligence, systems, and markets.",
    "home.signal.degree": "CS × Finance",
    "home.signal.llm": "LLM / Transformer",
    "home.signal.quant": "Quantization",
    "portal.researchs.title": "Researchs",
    "portal.researchs.copy": "Publications and research notes after release.",
    "portal.projects.title": "Projects",
    "portal.projects.copy": "Selected repos, demos, and tools.",
    "portal.blogs.title": "Blogs",
    "portal.blogs.copy": "Essays, notes, and longer thoughts.",
    "portal.contact.title": "Contact",
    "portal.contact.copy": "Friend links and public connections.",
    "page.researchs.eyebrow": "Researchs",
    "page.researchs.title": "Researchs",
    "page.researchs.subtitle": "Public research updates, paper links, and selected notes will appear here after release.",
    "page.projects.eyebrow": "Projects",
    "page.projects.title": "Projects",
    "page.projects.subtitle": "Selected repositories, demos, and tools will be collected here.",
    "page.blogs.eyebrow": "Blogs",
    "page.blogs.title": "Blogs",
    "page.blogs.subtitle": "Essays, notes, and longer thoughts will live here.",
    "page.contact.eyebrow": "Contact",
    "page.contact.title": "Friend Links",
    "page.contact.subtitle": "A quiet page for public friend links, personal sites, and blogs.",
    "entry.researchs.status": "Under Review",
    "entry.researchs.title": "A mysterious AAAI submission",
    "entry.researchs.copy": "A natural language processing study. Details will be released after acceptance.",
    "empty.title": "No public entries yet",
    "empty.researchs.copy": "Research content will be listed here when it is ready for public viewing.",
    "empty.projects.copy": "Project writeups and links will appear here when they are ready.",
    "empty.blogs.copy": "Published writing will appear here when the archive is ready.",
    "empty.contact.copy": "Friend links will appear here when the list is ready."
  },
  zh: {
    "nav.about": "关于",
    "nav.researchs": "研究",
    "nav.projects": "项目",
    "nav.blogs": "博客",
    "nav.contact": "友链",
    "action.email": "邮箱",
    "home.eyebrow": "清华大学",
    "home.headline": "清华大学计算机与金融双学位本科生，目前在 THU College AI ΔI Lab 从事 LLM 和 Transformer 相关研究。",
    "home.muted": "关注大模型、模型量化，以及智能系统与市场的交叉方向。",
    "home.signal.degree": "计算机 × 金融",
    "home.signal.llm": "LLM / Transformer",
    "home.signal.quant": "模型量化",
    "portal.researchs.title": "研究",
    "portal.researchs.copy": "公开论文和研究记录将在发布后整理在这里。",
    "portal.projects.title": "项目",
    "portal.projects.copy": "公开项目、仓库和工具会整理在这里。",
    "portal.blogs.title": "博客",
    "portal.blogs.copy": "公开文章、随笔和长文本会放在这里。",
    "portal.contact.title": "友链",
    "portal.contact.copy": "公开友链与个人站点入口。",
    "page.researchs.eyebrow": "研究",
    "page.researchs.title": "研究",
    "page.researchs.subtitle": "公开研究更新、论文链接与精选笔记会在发布后放在这里。",
    "page.projects.eyebrow": "项目",
    "page.projects.title": "项目",
    "page.projects.subtitle": "公开项目、仓库、演示和工具会收集在这里。",
    "page.blogs.eyebrow": "博客",
    "page.blogs.title": "博客",
    "page.blogs.subtitle": "公开文章、笔记和更长的想法会放在这里。",
    "page.contact.eyebrow": "友链",
    "page.contact.title": "友链",
    "page.contact.subtitle": "这里用于放置公开友链、个人站点和博客。",
    "entry.researchs.status": "在投",
    "entry.researchs.title": "神秘的AAAI在投",
    "entry.researchs.copy": "一项关于自然语言处理的研究，将在中稿之后公布。",
    "empty.title": "暂无公开内容",
    "empty.researchs.copy": "相关研究内容准备公开后会在这里展示。",
    "empty.projects.copy": "项目介绍和链接准备公开后会在这里展示。",
    "empty.blogs.copy": "公开写作归档准备好后会在这里展示。",
    "empty.contact.copy": "友链列表准备好后会在这里展示。"
  }
};

function normalizeLanguage(language) {
  return supportedLanguages.includes(language) ? language : "en";
}

function getStoredLanguage() {
  try {
    return localStorage.getItem(languageStorageKey);
  } catch (error) {
    return null;
  }
}

function setStoredLanguage(language) {
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch (error) {
    // Storage can be unavailable in restricted contexts.
  }
}

function getInitialLanguage() {
  const storedLanguage = getStoredLanguage();

  if (supportedLanguages.includes(storedLanguage)) {
    return storedLanguage;
  }

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || ""];

  return browserLanguages.some((language) => language.toLowerCase().startsWith("zh"))
    ? "zh"
    : "en";
}

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

function applyLanguage(language, shouldPersist = true) {
  const selectedLanguage = normalizeLanguage(language);
  const strings = translations[selectedLanguage];

  root.lang = selectedLanguage === "zh" ? "zh-CN" : "en";
  document.body.dataset.language = selectedLanguage;

  translatableNodes.forEach((node) => {
    const translatedText = strings[node.dataset.i18n];

    if (translatedText) {
      node.textContent = translatedText;
    }
  });

  const title = selectedLanguage === "zh"
    ? document.body.dataset.titleZh
    : document.body.dataset.titleEn;
  const description = selectedLanguage === "zh"
    ? document.body.dataset.descriptionZh
    : document.body.dataset.descriptionEn;

  if (title) {
    document.title = title;
  }

  if (metaDescription && description) {
    metaDescription.setAttribute("content", description);
  }

  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === selectedLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (shouldPersist) {
    setStoredLanguage(selectedLanguage);
  }
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});
window.addEventListener("pointermove", setPointerPosition, { passive: true });
window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();
setActiveNav(currentPage);
applyLanguage(getInitialLanguage(), false);

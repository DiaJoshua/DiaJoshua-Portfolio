const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const root = document.documentElement;

class SiteRail extends HTMLElement {
  connectedCallback() {
    const current =
      this.getAttribute("page") || document.body.dataset.page || "home";
    const link = (page, href, icon, label, extra = "") => `
      <a class="rail-link" href="${href}" ${page === current ? 'aria-current="page"' : ""} ${extra}>
        <span class="rail-icon" aria-hidden="true">${icon}</span><span>${label}</span>
      </a>`;

    this.innerHTML = `
      <header class="mobile-bar">
        <a class="mobile-brand" href="index.html">JD / Joshua Dia</a>
        <button class="menu-button" type="button" data-menu-toggle aria-expanded="false" aria-controls="portfolio-navigation">
          <span class="menu-lines" aria-hidden="true"></span><span>Menu</span>
        </button>
      </header>
      <button class="mobile-scrim" type="button" data-close-menu aria-label="Close navigation"></button>
      <aside class="site-rail" id="portfolio-navigation" aria-label="Portfolio navigation">
        <a class="rail-brand" href="index.html">
          <span class="rail-brand-mark">JD</span><span>Joshua Dia</span>
        </a>
        <nav class="rail-nav">
          <div class="rail-group">
            <p class="rail-group-label">Portfolio</p>
            ${link("home", "index.html", "⌂", "Home")}
            ${link("experience", "experience.html", "↳", "Experience")}
            ${link("certifications", "certifications.html", "✓", "Certifications")}
            ${link("stack", "stack.html", "#", "Stack")}
            ${link("projects", "projects.html", "◇", "Projects")}
            ${link("resume", "assets/resume/RESUME_JD_SEPT_2026.pdf", "↓", "Résumé", 'download="RESUME_JD_SEPT_2026.pdf"')}
          </div>
        </nav>
        <div class="rail-spacer"></div>
        <div class="rail-status">
          <p class="availability-line"><span class="status-dot" aria-hidden="true"></span>Open for opportunities</p>
        </div>
        <div class="rail-utility-row" aria-label="Appearance and sound">
          <button class="utility-button" type="button" data-theme-mode="system" aria-label="Use system appearance" title="System appearance">▣</button>
          <button class="utility-button" type="button" data-theme-mode="light" aria-label="Use light appearance" title="Light appearance">☼</button>
          <button class="utility-button" type="button" data-theme-mode="dark" aria-label="Use dark appearance" title="Dark appearance">☾</button>
          <button class="utility-button" type="button" data-sound-toggle aria-label="Turn interface sounds on" aria-pressed="false" title="Sounds off">⌁</button>
        </div>
        <div class="rail-contact">
          <span>Open for inquiries, collaborations, and opportunities.</span>
          <a href="mailto:diajoshua05@gmail.com">diajoshua05@gmail.com</a>
          <span class="rail-clock" data-manila-time>Manila · —</span>
        </div>
      </aside>`;
  }
}

customElements.define("site-rail", SiteRail);

const projectDetails = {
  clicksmart: {
    label: "ClickSmart / project note",
    title: "Making cyber-law information easier to ask about.",
    copy: "ClickSmart combined a responsive web interface with a GPT-2 model fine-tuned on Philippine cyber-law resources. The project covered data preparation, model training and inference, front-end integration, and deployment on Render.",
  },
  tienda: {
    label: "Tienda / project note",
    title: "Working through a complete product flow.",
    copy: "Tienda is a MERN e-commerce application built around connected product, account, cart, and payment-related workflows. It was useful practice in seeing how front-end choices, APIs, persistence, and user state affect one another.",
  },
  data: {
    label: "Applied data / lab note",
    title: "Small experiments that make concepts concrete.",
    copy: "This shelf includes a Philippine peso bill identifier using Python and OpenCV, plus analytics and dashboard exercises. These are learning projects rather than commercial products, and they are presented that way.",
  },
};

function appendGlobalUI() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <dialog id="info-dialog" aria-labelledby="info-title">
      <div class="dialog-body">
        <div class="dialog-top">
          <p class="small-label" data-info-label>Portfolio note</p>
          <button class="dialog-close" type="button" data-close-dialog aria-label="Close">×</button>
        </div>
        <h2 class="dialog-heading" id="info-title" data-info-title>A closer look.</h2>
        <p class="dialog-copy" data-info-copy></p>
      </div>
    </dialog>
    <div class="toast" role="status" aria-live="polite" data-toast></div>`,
  );
}

appendGlobalUI();

let toastTimer;
function showToast(message) {
  const toast = $("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function setMenu(open) {
  document.body.classList.toggle("nav-open", open);
  document.body.classList.toggle("is-locked", open);
  $("[data-menu-toggle]")?.setAttribute("aria-expanded", String(open));
}

$("[data-menu-toggle]")?.addEventListener("click", () =>
  setMenu(!document.body.classList.contains("nav-open")),
);
$("[data-close-menu]")?.addEventListener("click", () => setMenu(false));
$$(".rail-link").forEach((item) =>
  item.addEventListener("click", () => setMenu(false)),
);

let themeMode = "system";
try {
  themeMode = localStorage.getItem("jd-theme-mode") || "system";
} catch (error) {}
const systemDark = matchMedia("(prefers-color-scheme: dark)");

function resolveDark(mode) {
  return mode === "dark" || (mode === "system" && systemDark.matches);
}

function paintTheme(mode) {
  const dark = resolveDark(mode);
  root.toggleAttribute("data-theme", dark);
  if (dark) root.dataset.theme = "dark";
  else root.removeAttribute("data-theme");
  $$("[data-theme-mode]").forEach((button) =>
    button.classList.toggle("is-active", button.dataset.themeMode === mode),
  );
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#090b0e" : "#f7f8fa";
}

paintTheme(themeMode);
systemDark.addEventListener?.("change", () => {
  if (themeMode === "system") paintTheme("system");
});

$$("[data-theme-mode]").forEach((button) =>
  button.addEventListener("click", (event) => {
    const next = button.dataset.themeMode;
    const box = button.getBoundingClientRect();
    const x = event.clientX || box.left + box.width / 2;
    const y = event.clientY || box.top + box.height / 2;
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    const update = () => {
      themeMode = next;
      try {
        localStorage.setItem("jd-theme-mode", next);
      } catch (error) {}
      paintTheme(next);
    };
    if (
      document.startViewTransition &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      root.classList.add("theme-transitioning");
      const transition = document.startViewTransition(update);
      transition.finished.finally(() =>
        root.classList.remove("theme-transitioning"),
      );
    } else update();
    playSound(
      next === "dark"
        ? "theme-dark"
        : next === "light"
          ? "theme-light"
          : "theme-system",
    );
  }),
);

let soundEnabled = false;
let audioContext;
let soundOutput;
let lastHoverSound = 0;
const hoveredControls = new WeakMap();
try {
  soundEnabled = localStorage.getItem("jd-sound") === "on";
} catch (error) {}

function syncSoundButton() {
  $$("[data-sound-toggle]").forEach((button) => {
    button.classList.toggle("is-active", soundEnabled);
    button.setAttribute("aria-pressed", String(soundEnabled));
    button.setAttribute(
      "aria-label",
      soundEnabled ? "Turn interface sounds off" : "Turn interface sounds on",
    );
    button.title = soundEnabled ? "Sounds on" : "Sounds off";
  });
}

function getAudioEngine() {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (!soundOutput) {
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 16;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;
      soundOutput = audioContext.createGain();
      soundOutput.gain.value = 0.72;
      soundOutput.connect(compressor).connect(audioContext.destination);
    }
    if (audioContext.state === "suspended")
      audioContext.resume().catch(() => {});
    return audioContext;
  } catch (error) {
    return null;
  }
}

function scheduleTone({
  frequency,
  endFrequency = frequency,
  delay = 0,
  duration = 0.055,
  volume = 0.012,
  type = "sine",
}) {
  const context = getAudioEngine();
  if (!context || !soundOutput) return;
  try {
    const start = context.currentTime + delay;
    const stop = start + duration;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(endFrequency, 1),
      stop,
    );
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      volume,
      start + Math.min(0.009, duration * 0.22),
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, stop);
    oscillator.connect(gain).connect(soundOutput);
    oscillator.start(start);
    oscillator.stop(stop + 0.01);
  } catch (error) {}
}

const soundCues = {
  hover: [
    {
      frequency: 430,
      endFrequency: 475,
      duration: 0.032,
      volume: 0.006,
      type: "sine",
    },
    {
      frequency: 860,
      endFrequency: 910,
      delay: 0.006,
      duration: 0.026,
      volume: 0.0025,
      type: "triangle",
    },
  ],
  press: [
    {
      frequency: 210,
      endFrequency: 155,
      duration: 0.045,
      volume: 0.009,
      type: "sine",
    },
    {
      frequency: 620,
      endFrequency: 530,
      duration: 0.038,
      volume: 0.004,
      type: "triangle",
    },
  ],
  navigate: [
    {
      frequency: 390,
      endFrequency: 500,
      duration: 0.055,
      volume: 0.008,
      type: "sine",
    },
    {
      frequency: 620,
      endFrequency: 740,
      delay: 0.025,
      duration: 0.05,
      volume: 0.005,
      type: "triangle",
    },
  ],
  select: [
    {
      frequency: 460,
      endFrequency: 520,
      duration: 0.04,
      volume: 0.007,
      type: "sine",
    },
    {
      frequency: 690,
      endFrequency: 760,
      delay: 0.018,
      duration: 0.035,
      volume: 0.004,
      type: "triangle",
    },
  ],
  open: [
    {
      frequency: 350,
      endFrequency: 470,
      duration: 0.07,
      volume: 0.008,
      type: "sine",
    },
    {
      frequency: 560,
      endFrequency: 710,
      delay: 0.028,
      duration: 0.065,
      volume: 0.005,
      type: "triangle",
    },
  ],
  success: [
    {
      frequency: 520,
      endFrequency: 570,
      duration: 0.06,
      volume: 0.008,
      type: "sine",
    },
    {
      frequency: 780,
      endFrequency: 860,
      delay: 0.04,
      duration: 0.075,
      volume: 0.006,
      type: "triangle",
    },
  ],
  enable: [
    {
      frequency: 420,
      endFrequency: 480,
      duration: 0.06,
      volume: 0.009,
      type: "sine",
    },
    {
      frequency: 620,
      endFrequency: 690,
      delay: 0.045,
      duration: 0.07,
      volume: 0.007,
      type: "triangle",
    },
    {
      frequency: 840,
      endFrequency: 920,
      delay: 0.09,
      duration: 0.08,
      volume: 0.005,
      type: "sine",
    },
  ],
  disable: [
    {
      frequency: 720,
      endFrequency: 620,
      duration: 0.06,
      volume: 0.007,
      type: "triangle",
    },
    {
      frequency: 470,
      endFrequency: 350,
      delay: 0.045,
      duration: 0.08,
      volume: 0.008,
      type: "sine",
    },
  ],
  "theme-light": [
    {
      frequency: 520,
      endFrequency: 600,
      duration: 0.055,
      volume: 0.008,
      type: "sine",
    },
    {
      frequency: 760,
      endFrequency: 860,
      delay: 0.035,
      duration: 0.07,
      volume: 0.005,
      type: "triangle",
    },
  ],
  "theme-dark": [
    {
      frequency: 620,
      endFrequency: 540,
      duration: 0.06,
      volume: 0.007,
      type: "triangle",
    },
    {
      frequency: 390,
      endFrequency: 330,
      delay: 0.035,
      duration: 0.08,
      volume: 0.008,
      type: "sine",
    },
  ],
  "theme-system": [
    {
      frequency: 470,
      endFrequency: 540,
      duration: 0.055,
      volume: 0.007,
      type: "sine",
    },
    {
      frequency: 660,
      endFrequency: 610,
      delay: 0.035,
      duration: 0.065,
      volume: 0.005,
      type: "triangle",
    },
  ],
};

function playSound(name) {
  if (!soundEnabled) return;
  soundCues[name]?.forEach(scheduleTone);
}

syncSoundButton();
$$("[data-sound-toggle]").forEach((button) =>
  button.addEventListener("click", () => {
    if (soundEnabled) {
      playSound("disable");
      soundEnabled = false;
    } else {
      soundEnabled = true;
      getAudioEngine();
      playSound("enable");
    }
    try {
      localStorage.setItem("jd-sound", soundEnabled ? "on" : "off");
    } catch (error) {}
    syncSoundButton();
    showToast(soundEnabled ? "Interface sounds on." : "Interface sounds off.");
  }),
);

document.addEventListener("pointerover", (event) => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const control = event.target.closest("a, button, input");
  if (
    !control ||
    control.matches(":disabled") ||
    control.contains(event.relatedTarget)
  )
    return;
  const now = performance.now();
  if (
    now - lastHoverSound < 85 ||
    now - (hoveredControls.get(control) || 0) < 220
  )
    return;
  lastHoverSound = now;
  hoveredControls.set(control, now);
  playSound("hover");
});

document.addEventListener("pointerdown", (event) => {
  if (event.button !== undefined && event.button !== 0) return;
  const control = event.target.closest("a, button");
  if (
    !control ||
    control.matches(":disabled, [data-sound-toggle], [data-theme-mode]")
  )
    return;
  if (control.matches("[data-cert-filter], [data-resource-filter]"))
    playSound("select");
  else if (control.matches("[data-project-detail], [data-open-proof]"))
    playSound("open");
  else if (control.matches("a[href]")) playSound("navigate");
  else playSound("press");
});

function updateManilaTime() {
  const value = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
  $$("[data-manila-time]").forEach((item) => {
    item.textContent = `Manila · ${value}`;
  });
}

updateManilaTime();
setInterval(updateManilaTime, 30000);

const progress = $("[data-page-progress]");
function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const aura = $(".pointer-aura");
addEventListener(
  "pointermove",
  (event) => {
    if (!aura || event.pointerType === "touch") return;
    document.body.classList.add("has-pointer");
    aura.style.setProperty("--x", `${event.clientX}px`);
    aura.style.setProperty("--y", `${event.clientY}px`);
  },
  { passive: true },
);

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
      )
    : null;

$$(".reveal").forEach((item, index) => {
  item.style.setProperty("--delay", `${Math.min(index % 4, 3) * 55}ms`);
  if (revealObserver) revealObserver.observe(item);
  else item.classList.add("is-visible");
});

$$(".tilt").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("(pointer: coarse)").matches
    )
      return;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    card.style.setProperty("--rx", `${-y * 4}deg`);
    card.style.setProperty("--ry", `${x * 5}deg`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
  });
});

$$(".magnetic").forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    if (matchMedia("(pointer: coarse)").matches) return;
    const box = item.getBoundingClientRect();
    item.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * 0.08}px, ${(event.clientY - box.top - box.height / 2) * 0.12}px)`;
  });
  item.addEventListener("pointerleave", () =>
    item.style.removeProperty("transform"),
  );
});

$$("[data-close-dialog]").forEach((button) =>
  button.addEventListener("click", () => button.closest("dialog").close()),
);
$$("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  }),
);

function openInfo(detail) {
  $("[data-info-label]").textContent = detail.label;
  $("[data-info-title]").textContent = detail.title;
  $("[data-info-copy]").textContent = detail.copy;
  $("#info-dialog").showModal();
}

$$("[data-project-detail]").forEach((button) =>
  button.addEventListener("click", () =>
    openInfo(projectDetails[button.dataset.projectDetail]),
  ),
);

$$("[data-copy-email]").forEach((button) =>
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("diajoshua05@gmail.com");
      playSound("success");
      showToast("Email copied.");
    } catch (error) {
      showToast("diajoshua05@gmail.com");
    }
  }),
);

// Proof viewer — opens a certificate/exam record (image or PDF) in a
// centered dialog instead of navigating away from the page.
const proofDialog = $("#proof-dialog");
const proofLabelEl = $("[data-proof-label]", proofDialog);
const proofTitleEl = $("[data-proof-title]", proofDialog);
const proofCopyEl = $("[data-proof-copy]", proofDialog);
const proofBodyEl = $("[data-proof-body]", proofDialog);

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function openProof(trigger) {
  if (!proofDialog) return;
  const {
    proofType = "image",
    proofSrc,
    proofTitle,
    proofLabel,
    proofNote,
    proofExternal,
  } = trigger.dataset;
  if (!proofSrc) return;

  const title =
    proofTitle ||
    trigger.closest("[data-cert-card]")?.querySelector("h3")?.textContent ||
    "Certificate";
  const safeTitle = escapeHtml(title);
  const safeSrc = escapeHtml(proofSrc);

  if (proofLabelEl) proofLabelEl.textContent = proofLabel || "Proof";
  if (proofTitleEl) proofTitleEl.textContent = title;
  if (proofCopyEl) {
    proofCopyEl.textContent = proofNote || "";
    proofCopyEl.toggleAttribute("hidden", !proofNote);
  }

  const externalLink = proofExternal
    ? `<a class="proof-fallback" href="${escapeHtml(proofExternal)}" target="_blank" rel="noopener">Verify online ↗</a>`
    : "";

  if (proofBodyEl) {
    if (proofType === "pdf") {
      proofBodyEl.innerHTML = `
        <iframe class="proof-frame" src="${safeSrc}" title="${safeTitle} — proof document" loading="lazy"></iframe>
        <a class="proof-fallback" href="${safeSrc}" target="_blank" rel="noopener">Open PDF in a new tab ↗</a>
        ${externalLink}`;
    } else {
      proofBodyEl.innerHTML = `<img class="proof-image" src="${safeSrc}" alt="${safeTitle} — supporting proof" loading="lazy" />${externalLink}`;
      const img = $("img", proofBodyEl);
      if (img) {
        img.addEventListener("error", () => {
          img.remove();
          proofBodyEl.insertAdjacentHTML(
            "afterbegin",
            `<p class="proof-error">Couldn't load the image at <code>${safeSrc}</code>. Check that the file is committed at that exact path and name (case-sensitive on GitHub Pages).${proofExternal ? " You can verify it online instead." : ""}</p>`,
          );
        });
      }
    }
  }

  if (typeof proofDialog.showModal === "function") proofDialog.showModal();
}

$$("[data-open-proof]").forEach((button) =>
  button.addEventListener("click", () => openProof(button)),
);

// Clear the injected proof content on close so hidden PDFs/images stop
// loading in the background.
proofDialog?.addEventListener("close", () => {
  if (proofBodyEl) proofBodyEl.innerHTML = "";
});

const certCards = $$("[data-cert-card]");
const certSearch = $("[data-cert-search]");
let activeCertFilter = "all";

function filterCertifications() {
  if (!certCards.length) return;
  const query = (certSearch?.value || "").trim().toLowerCase();
  let visible = 0;
  certCards.forEach((card) => {
    const categoryMatches =
      activeCertFilter === "all" || card.dataset.category === activeCertFilter;
    const searchMatches =
      !query || card.dataset.search.toLowerCase().includes(query);
    const show = categoryMatches && searchMatches;
    card.classList.toggle("is-hidden", !show);
    if (show) visible += 1;
  });
  $("[data-cert-empty]")?.toggleAttribute("hidden", visible !== 0);
  $$("[data-cert-group]").forEach((group) => {
    const groupHasVisible = $$("[data-cert-card]", group).some(
      (card) => !card.classList.contains("is-hidden"),
    );
    group.toggleAttribute("hidden", !groupHasVisible);
  });
}

$$("[data-cert-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    activeCertFilter = button.dataset.certFilter;
    $$("[data-cert-filter]").forEach((item) =>
      item.classList.toggle("is-active", item === button),
    );
    filterCertifications();
  }),
);
certSearch?.addEventListener("input", filterCertifications);

const resourceCards = $$("[data-resource-card]");
const resourceSearch = $("[data-resource-search]");
let activeResourceFilter = "all";

function filterResources() {
  if (!resourceCards.length) return;
  const query = (resourceSearch?.value || "").trim().toLowerCase();
  let visible = 0;
  resourceCards.forEach((card) => {
    const categoryMatches =
      activeResourceFilter === "all" ||
      card.dataset.category === activeResourceFilter;
    const searchMatches =
      !query || card.dataset.search.toLowerCase().includes(query);
    const show = categoryMatches && searchMatches;
    card.classList.toggle("is-hidden", !show);
    if (show) visible += 1;
  });
  $("[data-resource-empty]")?.toggleAttribute("hidden", visible !== 0);
  $$("[data-resource-group]").forEach((group) => {
    const groupHasVisible = $$("[data-resource-card]", group).some(
      (card) => !card.classList.contains("is-hidden"),
    );
    group.toggleAttribute("hidden", !groupHasVisible);
  });
}

$$("[data-resource-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    activeResourceFilter = button.dataset.resourceFilter;
    $$("[data-resource-filter]").forEach((item) =>
      item.classList.toggle("is-active", item === button),
    );
    filterResources();
  }),
);
resourceSearch?.addEventListener("input", filterResources);

document.addEventListener("keydown", (event) => {
  const typing =
    /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) ||
    document.activeElement?.isContentEditable;
  if (event.key === "Escape" && !$$("dialog[open]").length && !typing)
    setMenu(false);
});

const rotatingWord = $("[data-rotating-word]");
if (rotatingWord && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const words = ["learning", "contributing", "improving"];
  let wordIndex = 0;
  setInterval(() => {
    rotatingWord
      .animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-7px)" },
        ],
        { duration: 180, fill: "forwards" },
      )
      .finished.then(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotatingWord.textContent = words[wordIndex];
        rotatingWord.animate(
          [
            { opacity: 0, transform: "translateY(7px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 260, fill: "forwards" },
        );
      });
  }, 2600);
}

$$("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});
requestAnimationFrame(() =>
  requestAnimationFrame(() => document.body.classList.add("is-ready")),
);

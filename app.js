const CACHE_RESET_KEY = 'jd-cache-reset-20260904-3';
try {
  if (!localStorage.getItem(CACHE_RESET_KEY)) {
    navigator.serviceWorker?.getRegistrations().then(registrations => registrations.forEach(registration => registration.unregister()));
    globalThis.caches?.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
    localStorage.setItem(CACHE_RESET_KEY, 'done');
  }
} catch (error) {
  // Storage can be unavailable in strict privacy modes; the portfolio still works without this reset.
}

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const root = document.documentElement;

class SiteRail extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute('page') || document.body.dataset.page || 'home';
    const link = (page, href, icon, label, extra = '') => `
      <a class="rail-link" href="${href}" ${page === current ? 'aria-current="page"' : ''} ${extra}>
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
            ${link('home', 'index.html', '⌂', 'Home')}
            ${link('projects', 'projects.html', '◇', 'Projects')}
            ${link('experience', 'experience.html', '↳', 'Experience')}
            ${link('stack', 'stack.html', '#', 'Stack')}
            ${link('certifications', 'certifications.html', '✓', 'Certifications')}
            ${link('resources', 'resources.html', '▥', 'Resources')}
            ${link('resume', 'assets/resume/RESUME_JD_SEPT_2026.pdf', '↓', 'Résumé', 'download="RESUME_JD_SEPT_2026.pdf"')}
          </div>
        </nav>
        <div class="rail-spacer"></div>
        <div class="rail-status">
          <p class="availability-line"><span class="status-dot" aria-hidden="true"></span>Open to entry-level roles</p>
        </div>
        <div class="rail-utility-row" aria-label="Appearance and sound">
          <button class="utility-button" type="button" data-theme-mode="system" aria-label="Use system appearance" title="System appearance">▣</button>
          <button class="utility-button" type="button" data-theme-mode="light" aria-label="Use light appearance" title="Light appearance">☼</button>
          <button class="utility-button" type="button" data-theme-mode="dark" aria-label="Use dark appearance" title="Dark appearance">☾</button>
          <button class="utility-button" type="button" data-sound-toggle aria-label="Turn interface sounds on" aria-pressed="false" title="Sounds off">⌁</button>
        </div>
        <div class="rail-contact">
          <span>For junior roles and technical conversations.</span>
          <a href="mailto:diajoshua05@gmail.com">diajoshua05@gmail.com</a>
          <span class="rail-clock" data-manila-time>Manila · —</span>
        </div>
      </aside>`;
  }
}

customElements.define('site-rail', SiteRail);

const projectDetails = {
  clicksmart: {
    label: 'ClickSmart / project note',
    title: 'Making cyber-law information easier to ask about.',
    copy: 'ClickSmart combined a responsive web interface with a GPT-2 model fine-tuned on Philippine cyber-law resources. The project covered data preparation, model training and inference, front-end integration, and deployment on Render.'
  },
  tienda: {
    label: 'Tienda / project note',
    title: 'Working through a complete product flow.',
    copy: 'Tienda is a MERN e-commerce application built around connected product, account, cart, and payment-related workflows. It was useful practice in seeing how front-end choices, APIs, persistence, and user state affect one another.'
  },
  data: {
    label: 'Applied data / lab note',
    title: 'Small experiments that make concepts concrete.',
    copy: 'This shelf includes a Philippine peso bill identifier using Python and OpenCV, plus analytics and dashboard exercises. These are learning projects rather than commercial products, and they are presented that way.'
  }
};

function appendGlobalUI() {
  document.body.insertAdjacentHTML('beforeend', `
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
    <div class="toast" role="status" aria-live="polite" data-toast></div>`);
}

appendGlobalUI();

let toastTimer;
function showToast(message) {
  const toast = $('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function setMenu(open) {
  document.body.classList.toggle('nav-open', open);
  document.body.classList.toggle('is-locked', open);
  $('[data-menu-toggle]')?.setAttribute('aria-expanded', String(open));
}

$('[data-menu-toggle]')?.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
$('[data-close-menu]')?.addEventListener('click', () => setMenu(false));
$$('.rail-link').forEach(item => item.addEventListener('click', () => setMenu(false)));

let themeMode = 'system';
try { themeMode = localStorage.getItem('jd-theme-mode') || 'system'; } catch (error) {}
const systemDark = matchMedia('(prefers-color-scheme: dark)');

function resolveDark(mode) {
  return mode === 'dark' || (mode === 'system' && systemDark.matches);
}

function paintTheme(mode) {
  const dark = resolveDark(mode);
  root.toggleAttribute('data-theme', dark);
  if (dark) root.dataset.theme = 'dark';
  else root.removeAttribute('data-theme');
  $$('[data-theme-mode]').forEach(button => button.classList.toggle('is-active', button.dataset.themeMode === mode));
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#090b0e' : '#f7f8fa';
}

paintTheme(themeMode);
systemDark.addEventListener?.('change', () => { if (themeMode === 'system') paintTheme('system'); });

$$('[data-theme-mode]').forEach(button => button.addEventListener('click', event => {
  const next = button.dataset.themeMode;
  const box = button.getBoundingClientRect();
  const x = event.clientX || box.left + box.width / 2;
  const y = event.clientY || box.top + box.height / 2;
  root.style.setProperty('--theme-x', `${x}px`);
  root.style.setProperty('--theme-y', `${y}px`);
  const update = () => {
    themeMode = next;
    try { localStorage.setItem('jd-theme-mode', next); } catch (error) {}
    paintTheme(next);
  };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transitioning');
    const transition = document.startViewTransition(update);
    transition.finished.finally(() => root.classList.remove('theme-transitioning'));
  } else update();
  playTone(next === 'dark' ? 430 : next === 'light' ? 670 : 550, .07, .026);
}));

let soundEnabled = false;
let audioContext;
let lastTone = 0;
try { soundEnabled = localStorage.getItem('jd-sound') === 'on'; } catch (error) {}

function syncSoundButton() {
  $$('[data-sound-toggle]').forEach(button => {
    button.classList.toggle('is-active', soundEnabled);
    button.setAttribute('aria-pressed', String(soundEnabled));
    button.setAttribute('aria-label', soundEnabled ? 'Turn interface sounds off' : 'Turn interface sounds on');
    button.title = soundEnabled ? 'Sounds on' : 'Sounds off';
  });
}

function playTone(frequency = 440, duration = .045, volume = .018) {
  if (!soundEnabled) return;
  const now = performance.now();
  if (now - lastTone < 60) return;
  lastTone = now;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {}
}

syncSoundButton();
$$('[data-sound-toggle]').forEach(button => button.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  try { localStorage.setItem('jd-sound', soundEnabled ? 'on' : 'off'); } catch (error) {}
  syncSoundButton();
  if (soundEnabled) playTone(720, .08, .032);
  showToast(soundEnabled ? 'Interface sounds on.' : 'Interface sounds off.');
}));

document.addEventListener('pointerover', event => {
  if (event.target.closest('a, button, input') && !event.relatedTarget?.closest?.('a, button, input')) playTone(350, .035, .01);
});
document.addEventListener('pointerdown', event => {
  if (event.target.closest('a, button')) playTone(520, .05, .018);
});

function updateManilaTime() {
  const value = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date());
  $$('[data-manila-time]').forEach(item => { item.textContent = `Manila · ${value}`; });
}

updateManilaTime();
setInterval(updateManilaTime, 30000);

const progress = $('[data-page-progress]');
function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const aura = $('.pointer-aura');
addEventListener('pointermove', event => {
  if (!aura || event.pointerType === 'touch') return;
  document.body.classList.add('has-pointer');
  aura.style.setProperty('--x', `${event.clientX}px`);
  aura.style.setProperty('--y', `${event.clientY}px`);
}, { passive: true });

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .12, rootMargin: '0px 0px -4% 0px' }) : null;

$$('.reveal').forEach((item, index) => {
  item.style.setProperty('--delay', `${Math.min(index % 4, 3) * 55}ms`);
  if (revealObserver) revealObserver.observe(item);
  else item.classList.add('is-visible');
});

$$('.tilt').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    card.style.setProperty('--rx', `${-y * 4}deg`);
    card.style.setProperty('--ry', `${x * 5}deg`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.removeProperty('--rx');
    card.style.removeProperty('--ry');
  });
});

$$('.magnetic').forEach(item => {
  item.addEventListener('pointermove', event => {
    if (matchMedia('(pointer: coarse)').matches) return;
    const box = item.getBoundingClientRect();
    item.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * .08}px, ${(event.clientY - box.top - box.height / 2) * .12}px)`;
  });
  item.addEventListener('pointerleave', () => item.style.removeProperty('transform'));
});

$$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
}));

function openInfo(detail) {
  $('[data-info-label]').textContent = detail.label;
  $('[data-info-title]').textContent = detail.title;
  $('[data-info-copy]').textContent = detail.copy;
  $('#info-dialog').showModal();
}

$$('[data-project-detail]').forEach(button => button.addEventListener('click', () => openInfo(projectDetails[button.dataset.projectDetail])));

$$('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('diajoshua05@gmail.com');
    showToast('Email copied.');
  } catch (error) {
    showToast('diajoshua05@gmail.com');
  }
}));

const proofDialog = $('#proof-dialog');
$$('[data-open-proof]').forEach(button => button.addEventListener('click', () => proofDialog?.showModal()));

const certCards = $$('[data-cert-card]');
const certSearch = $('[data-cert-search]');
let activeCertFilter = 'all';

function filterCertifications() {
  if (!certCards.length) return;
  const query = (certSearch?.value || '').trim().toLowerCase();
  let visible = 0;
  certCards.forEach(card => {
    const categoryMatches = activeCertFilter === 'all' || card.dataset.category === activeCertFilter;
    const searchMatches = !query || card.dataset.search.toLowerCase().includes(query);
    const show = categoryMatches && searchMatches;
    card.classList.toggle('is-hidden', !show);
    if (show) visible += 1;
  });
  $('[data-cert-empty]')?.toggleAttribute('hidden', visible !== 0);
  $$('[data-cert-group]').forEach(group => {
    const groupHasVisible = $$('[data-cert-card]', group).some(card => !card.classList.contains('is-hidden'));
    group.toggleAttribute('hidden', !groupHasVisible);
  });
}

$$('[data-cert-filter]').forEach(button => button.addEventListener('click', () => {
  activeCertFilter = button.dataset.certFilter;
  $$('[data-cert-filter]').forEach(item => item.classList.toggle('is-active', item === button));
  filterCertifications();
}));
certSearch?.addEventListener('input', filterCertifications);

const resourceCards = $$('[data-resource-card]');
const resourceSearch = $('[data-resource-search]');
let activeResourceFilter = 'all';

function filterResources() {
  if (!resourceCards.length) return;
  const query = (resourceSearch?.value || '').trim().toLowerCase();
  let visible = 0;
  resourceCards.forEach(card => {
    const categoryMatches = activeResourceFilter === 'all' || card.dataset.category === activeResourceFilter;
    const searchMatches = !query || card.dataset.search.toLowerCase().includes(query);
    const show = categoryMatches && searchMatches;
    card.classList.toggle('is-hidden', !show);
    if (show) visible += 1;
  });
  $('[data-resource-empty]')?.toggleAttribute('hidden', visible !== 0);
  $$('[data-resource-group]').forEach(group => {
    const groupHasVisible = $$('[data-resource-card]', group).some(card => !card.classList.contains('is-hidden'));
    group.toggleAttribute('hidden', !groupHasVisible);
  });
}

$$('[data-resource-filter]').forEach(button => button.addEventListener('click', () => {
  activeResourceFilter = button.dataset.resourceFilter;
  $$('[data-resource-filter]').forEach(item => item.classList.toggle('is-active', item === button));
  filterResources();
}));
resourceSearch?.addEventListener('input', filterResources);

document.addEventListener('keydown', event => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if (event.key === 'Escape' && !$$('dialog[open]').length && !typing) setMenu(false);
});

const rotatingWord = $('[data-rotating-word]');
if (rotatingWord && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const words = ['learning', 'contributing', 'improving'];
  let wordIndex = 0;
  setInterval(() => {
    rotatingWord.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-7px)' }], { duration: 180, fill: 'forwards' }).finished.then(() => {
      wordIndex = (wordIndex + 1) % words.length;
      rotatingWord.textContent = words[wordIndex];
      rotatingWord.animate([{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, fill: 'forwards' });
    });
  }, 2600);
}

$$('[data-year]').forEach(item => { item.textContent = new Date().getFullYear(); });
requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));

/* ============================================================
   INSON DUBOIS WOOD — Design & Build Atelier
   Clean, scroll-driven interactions
   ------------------------------------------------------------
   01 · Loader
   02 · Smooth anchors
   03 · Nav behaviour
   04 · Overlay menu
   05 · Line-mask + reveal primitives
   06 · Hero (entrance + scroll parallax)
   07 · Cinematic reveal (Sondaven-style pullback)
   08 · Work (horizontal pinned)
   09 · Process (cross-fade acts)
   10 · Services (preview swap)
   11 · Counters
   12 · Footer giant drift
   13 · Contact form
   14 · Boot
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.matchMedia('(max-width: 820px)').matches;

if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

document.fonts && document.fonts.ready.then(() => {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});

/* ───── 01 · LOADER ───── */
function runLoader() {
  const loader = document.querySelector('[data-loader]');
  const count  = document.querySelector('[data-loader-count]');
  const bar    = document.querySelector('[data-loader-bar]');
  const veil   = document.querySelector('[data-loader-veil]');
  if (!loader) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      loader.classList.add('is-gone');
      loader.style.display = 'none';
      document.body.classList.remove('is-loading');
      resolve();
    };
    const safety = setTimeout(finish, 4000);

    const start = performance.now();
    const duration = reduceMotion ? 350 : 1400;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / duration);
      const eased = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const n = Math.round(eased * 100);
      if (count) count.textContent = String(n).padStart(2, '0');
      if (bar)   bar.style.width = n + '%';
      if (t < 1) requestAnimationFrame(tick);
      else {
        clearTimeout(safety);
        if (window.gsap) {
          gsap.timeline({ onComplete: finish })
            .to('.loader__center', { opacity: 0, y: -16, duration: .45, ease: 'power2.in' })
            .to(veil, { yPercent: -100, duration: .85, ease: 'expo.inOut' }, '-=.2');
        }
        setTimeout(finish, 1500);
      }
    };
    requestAnimationFrame(tick);
  });
}

/* ───── 02 · SMOOTH ANCHORS ───── */
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      closeMenu();
    });
  });
}

/* ───── 03 · NAV BEHAVIOUR ───── */
function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const isMenuOpen = document.body.classList.contains('menu-open');
    nav.classList.toggle('is-scrolled', y > 60);
    if (!isMenuOpen) {
      if (y > 140 && y > lastY + 4)      nav.classList.add('is-hidden');
      else if (y < lastY - 4)            nav.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
}

/* ───── 04 · OVERLAY MENU ───── */
function openMenu() {
  const m = document.querySelector('[data-menu]');
  if (!m) return;
  m.classList.add('is-open');
  m.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked', 'menu-open');
  const lbl = document.querySelector('[data-menu-label]');
  if (lbl) lbl.textContent = 'Close';
  const btn = document.querySelector('[data-menu-toggle]');
  if (btn) btn.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  const m = document.querySelector('[data-menu]');
  if (!m) return;
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked', 'menu-open');
  const lbl = document.querySelector('[data-menu-label]');
  if (lbl) lbl.textContent = 'Menu';
  const btn = document.querySelector('[data-menu-toggle]');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}
function initMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  if (btn) {
    btn.addEventListener('click', () => {
      const menu = document.querySelector('[data-menu]');
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}

/* ───── 05 · LINE-MASK + REVEAL PRIMITIVES ───── */
function initReveals() {
  document.body.classList.add('is-ready');
  if (!window.gsap || !window.ScrollTrigger) {
    // graceful fallback — show everything
    document.querySelectorAll('.line__inner').forEach(el => el.style.transform = 'translateY(0)');
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
    return;
  }

  // Lines outside the hero (hero handles its own).
  // Mask reveal via pixel-based fromTo — more reliable than yPercent vs CSS percent-translate.
  document.querySelectorAll('.line__inner').forEach((inner) => {
    const wrapper = inner.closest('.line');
    if (!wrapper) return;
    if (wrapper.closest('[data-hero]')) return;     // hero entrance handles these
    const offset = inner.getBoundingClientRect().height || inner.offsetHeight || 80;
    gsap.set(inner, { y: offset, opacity: 1 });
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(inner, { y: 0, duration: 1.05, ease: 'expo.out' })
    });
  });

  // .reveal blocks
  document.querySelectorAll('.reveal').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => el.classList.add('is-in'),
    });
  });
}

/* ───── 06 · HERO · pinned 3-act scroll scene ───── */
function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const eyebrow    = hero.querySelector('[data-hero-eyebrow]');
  const titleLines = hero.querySelectorAll('.hero__title .line__inner');
  const lede       = hero.querySelector('[data-hero-lede]');
  const cta        = hero.querySelector('[data-hero-cta]');
  const cue        = hero.querySelector('[data-hero-cue]');
  const corners    = hero.querySelectorAll('[data-hero-corner]');
  const caption    = hero.querySelector('[data-hero-caption]');
  const captionEls = caption ? caption.querySelectorAll('.hero__caption-eyebrow, .hero__caption-title') : [];
  const content    = hero.querySelector('[data-hero-content]');
  const bgImg      = hero.querySelector('.hero__bg img');
  const glow       = hero.querySelector('[data-hero-glow]');

  if (!window.gsap) {
    [eyebrow, lede, cta, cue, ...corners].forEach(el => el && (el.style.opacity = '1'));
    titleLines.forEach(el => { el.style.transform = 'none'; el.style.opacity = '1'; });
    return;
  }

  /* ── ENTRANCE ── */
  // Lock the line-mask initial state in pixels (more reliable than yPercent vs CSS percent-translate)
  titleLines.forEach((el) => {
    const h = el.getBoundingClientRect().height || el.offsetHeight || 100;
    gsap.set(el, { y: h, opacity: 1 });
  });

  const ent = gsap.timeline({ delay: .15 });
  if (eyebrow) ent.to(eyebrow, { opacity: 1, duration: .9, ease: 'power2.out' }, 0);
  if (titleLines.length)
    ent.to(titleLines, { y: 0, duration: 1.15, stagger: .08, ease: 'expo.out' }, .08);
  if (corners.length)
    ent.to(corners, { opacity: 1, duration: .8, stagger: .07, ease: 'power2.out' }, .3);
  if (lede) ent.to(lede, { opacity: 1, duration: .9, ease: 'power2.out' }, .55);
  if (cta)  ent.to(cta,  { opacity: 1, duration: .8, ease: 'power2.out' }, .72);
  if (cue)  ent.to(cue,  { opacity: 1, duration: .7, ease: 'power2.out' }, .9);

  if (reduceMotion || isMobile()) return;

  /* ── 3-ACT SCRUBBED CHOREOGRAPHY ──
       The hero is 240vh tall with a sticky inner. As you scroll:
         Act I  (0.00 → 0.30) — held composition, brand reads strong
         Act II (0.30 → 0.65) — content drifts up + fades, image brightens & zooms
         Act III(0.65 → 1.00) — "quiet light" caption fades in, image fully open
  */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end:   'bottom bottom',
      scrub: 0.6,
      invalidateOnRefresh: true,
    }
  });

  // Background image: parallax up + zoom out + brighten through the scene
  if (bgImg) {
    tl.to(bgImg, {
      yPercent: 12,
      scale: 1.04,
      filter: 'brightness(.85) saturate(.95) contrast(1.0)',
      ease: 'none',
    }, 0);
  }

  // Bronze glow expands and dims
  if (glow) {
    tl.to(glow, { scale: 1.35, opacity: 0.25, ease: 'none' }, 0);
  }

  // Hero content (eyebrow + title + lede + CTA) drifts up at its own speed
  if (content) {
    tl.to(content, { yPercent: -18, ease: 'none' }, 0);
    // Lede + CTA fade in Act II
    if (lede) tl.to(lede, { opacity: 0, duration: .2, ease: 'power2.in' }, 0.28);
    if (cta)  tl.to(cta,  { opacity: 0, duration: .2, ease: 'power2.in' }, 0.32);
  }

  // Corner labels drift apart slightly for depth
  corners.forEach((c, i) => {
    const dir = (i % 2 === 0) ? -1 : 1;
    tl.to(c, { y: dir * 24, opacity: 0.35, ease: 'none' }, 0.3);
  });

  // Act III caption "quiet light." fades in centered over the image
  if (caption && captionEls.length) {
    gsap.set(captionEls, { y: 30, opacity: 0 });
    tl.to(caption,    { opacity: 1, duration: .12 }, 0.55);
    tl.to(captionEls, { y: 0, opacity: 1, duration: .25, stagger: .06, ease: 'expo.out' }, 0.58);
  }

  // Scroll cue fades immediately
  if (cue) {
    tl.to(cue, { opacity: 0, duration: .1 }, 0.05);
  }
}

/* ───── 07 · CINEMATIC REVEAL ───── */
function initRevealScene() {
  const scene = document.querySelector('[data-scene="reveal"]');
  if (!scene || reduceMotion || isMobile() || !window.gsap) return;

  const frame  = scene.querySelector('[data-reveal-frame]');
  const img    = scene.querySelector('[data-reveal-img]');
  const captions = scene.querySelectorAll('.reveal-caption');
  const corners  = scene.querySelectorAll('.reveal-corner');
  const progBar  = scene.querySelector('[data-reveal-progress-bar]');
  if (!frame || !img) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end:   'bottom bottom',
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (progBar) progBar.style.transform = `scaleX(${self.progress.toFixed(3)})`;
      }
    }
  });

  tl.to(corners, { opacity: 1, duration: .08, ease: 'power2.out' }, 0.04);

  // Frame growth — two phases (postage-stamp → mid → full bleed)
  tl.to(frame, { width: '30vw', duration: .28, ease: 'power2.inOut' }, 0.05);
  tl.to(frame, { width: '100vw', height: '100vh', duration: .55, ease: 'power2.inOut' }, 0.34);

  // Image "camera pullback" — zoom-out
  tl.fromTo(img,
    { scale: 2.4, x: '6%', y: '-2%' },
    { scale: 1.7, x: '3%', y: '-1%', duration: .3, ease: 'power2.out' }, 0.05);
  tl.to(img, { scale: 1.05, x: '0%', y: '0%', duration: .55, ease: 'power2.inOut' }, 0.34);
  tl.to(img, { scale: 1.0, duration: .25, ease: 'none' }, 0.78);
  tl.to(img, { filter: 'brightness(0.85) contrast(1.06) saturate(0.9)', duration: .55, ease: 'power2.out' }, 0.32);

  // Three caption stages cross-fade
  const stages = [
    { in: 0.08, out: 0.30 },
    { in: 0.36, out: 0.58 },
    { in: 0.64, out: 0.92 },
  ];
  captions.forEach((cap, i) => {
    const w = stages[i];
    if (!w) return;
    tl.fromTo(cap, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .04 }, w.in);
    tl.to(cap, { opacity: 0, y: -30, duration: .04 }, w.out);
  });
}

/* ───── 08 · WORK — horizontal pinned ───── */
function initWork() {
  const work = document.querySelector('[data-work]');
  if (!work || !window.gsap) return;
  const viewport = work.querySelector('[data-work-viewport]');
  const track    = work.querySelector('[data-work-track]');
  const hudCur   = work.querySelector('[data-work-hud-current]');
  const hudBar   = work.querySelector('[data-work-hud-bar]');
  if (!viewport || !track) return;

  if (isMobile() || reduceMotion) return;

  const projects = work.querySelectorAll('[data-proj]');
  const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: viewport,
      start: 'top top+=70',
      end:   () => '+=' + distance(),
      scrub: 0.7,
      pin: viewport,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (hudBar) hudBar.style.transform = `scaleX(${self.progress.toFixed(3)})`;
        if (hudCur) {
          const total = projects.length;
          const idx = Math.min(total, Math.floor(self.progress * total) + 1);
          const label = String(idx).padStart(2, '0');
          if (hudCur.textContent !== label) hudCur.textContent = label;
        }
      }
    }
  });

  gsap.fromTo(projects, { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: .9, stagger: 0.05, ease: 'power3.out',
    scrollTrigger: { trigger: work, start: 'top 70%', once: true }
  });
}

/* ───── 09 · SERVICES — preview swap ───── */
function initServices() {
  const section = document.querySelector('[data-services]');
  if (!section) return;
  const list = section.querySelector('[data-services-list]');
  const img  = section.querySelector('[data-services-img]');
  const tag  = section.querySelector('[data-services-tag]');
  if (!list || !img) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const swap = (src, label) => {
    if (!src || img.src === src) return;
    if (!window.gsap) { img.src = src; if (tag && label) tag.textContent = label; return; }
    gsap.to(img, {
      opacity: 0, scale: 1.12, duration: .35, ease: 'power2.in',
      onComplete: () => {
        img.src = src;
        gsap.fromTo(img,
          { opacity: 0, scale: 1.14 },
          { opacity: 1, scale: 1.06, duration: .8, ease: 'power3.out' });
      }
    });
    if (tag && label) {
      gsap.to(tag, {
        opacity: 0, y: 6, duration: .22, ease: 'power2.in',
        onComplete: () => {
          tag.textContent = label;
          gsap.fromTo(tag, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out' });
        }
      });
    }
  };

  list.querySelectorAll('[data-srv]').forEach((row) => {
    const src   = row.getAttribute('data-img');
    const num   = row.querySelector('.srv__num')?.textContent.trim() || '';
    const name  = row.querySelector('.srv__name')?.textContent.trim() || '';
    const label = `${num} · ${name}`;
    const activate = () => {
      list.querySelectorAll('.srv').forEach((el) => el.classList.remove('is-active'));
      row.classList.add('is-active');
      swap(src, label);
    };
    if (fine) row.addEventListener('mouseenter', activate);
    row.addEventListener('click', activate);
    row.addEventListener('focusin', activate);
  });
}

/* ───── 11 · COUNTERS ───── */
function initCounters() {
  if (!window.gsap) return;
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.getAttribute('data-count')) || 0;
    const obj = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: end, duration: 1.6, ease: 'power3.out',
          onUpdate: () => { el.textContent = Math.round(obj.v); }
        });
      }
    });
  });
}

/* ───── 12 · FOOTER MARQUEE — cursor spotlight ───── */
function initFooterMarquee() {
  const m = document.querySelector('[data-footer-marquee]');
  if (!m) return;
  let rect = m.getBoundingClientRect();
  const refresh = () => { rect = m.getBoundingClientRect(); };
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('scroll', refresh, { passive: true });

  // Throttle to next animation frame
  let pending = false;
  let lastX = 0, lastY = 0;
  const apply = () => {
    pending = false;
    const x = ((lastX - rect.left) / rect.width) * 100;
    const y = ((lastY - rect.top) / rect.height) * 100;
    m.style.setProperty('--mx', x.toFixed(2) + '%');
    m.style.setProperty('--my', y.toFixed(2) + '%');
  };

  m.addEventListener('mousemove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!pending) {
      pending = true;
      requestAnimationFrame(apply);
    }
  }, { passive: true });
}

/* ───── 13 · CONTACT FORM ───── */
function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const note = form.querySelector('[data-form-note]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email) {
      if (note) note.textContent = 'Please share your name and email.';
      return;
    }
    if (note) note.textContent = 'Thank you. We will respond within two working days.';
    form.reset();
  });
}

/* ───── 14 · BOOT ───── */
(async function boot() {
  initAnchors();
  initNav();
  initMenu();
  initContactForm();
  initServices();

  await runLoader();

  requestAnimationFrame(() => {
    initReveals();
    initHero();
    initRevealScene();
    initWork();
    initCounters();
    initFooterMarquee();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();

window.addEventListener('load', () => {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});

let _resizeRaf;
window.addEventListener('resize', () => {
  cancelAnimationFrame(_resizeRaf);
  _resizeRaf = requestAnimationFrame(() => {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
});

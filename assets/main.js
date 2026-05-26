/* ==========================================================================
   hogarconectado.co — main.js (v2.1)
   - Hero video loop (Higgsfield Cinema Studio) en lugar de Three.js
   - GSAP intro timeline + ScrollTrigger reveals (fallback IntersectionObserver)
   - Header scroll state + mobile menu (escape / outside-click)
   - Year stamp + TOC scrollspy
   - Cursor spotlight for cards, count-up metrics formato es-ES, 3D card tilt
   ========================================================================== */

(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu (with escape + outside click) ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    const closeMenu = () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', (e) => {
      if (!links.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
  }

  /* ---------- Year stamp ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Reveal on scroll (fallback if no GSAP) ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  /* ---------- Count-up for hero metrics (formato es-ES con separador de miles) ---------- */
  const formatNum = (n) => n.toLocaleString('es-ES');
  const countUp = (el, target, prefix = '', suffix = '', duration = 1400) => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(target * eased);
      el.textContent = prefix + formatNum(current) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + formatNum(target) + suffix;
    };
    requestAnimationFrame(tick);
  };
  const metricObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      metricObs.unobserve(el);
      const raw = (el.textContent || '').trim();
      // Captura prefijo (+, -), número con puntos/comas como separador de miles, sufijo (€, %, etc.)
      const m = raw.match(/^([+\-]?)([\d.,]+)(.*)$/);
      if (m) {
        const prefix = m[1];
        // Quita separadores de miles antes de parsear (es-ES usa `.` como miles, no decimal)
        const num = parseInt(m[2].replace(/[.,]/g, ''), 10);
        const suffix = m[3];
        if (!Number.isNaN(num)) {
          el.textContent = prefix + '0' + suffix;
          setTimeout(() => countUp(el, num, prefix, suffix, 1300), 60);
        }
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.metric-num').forEach(el => metricObs.observe(el));

  /* ---------- Cursor spotlight on cards ---------- */
  if (!isCoarse) {
    const spotlights = document.querySelectorAll('.bento-card, .guide-card, .compare-col');
    spotlights.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });

    /* 3D tilt on bento cards */
    const tiltables = document.querySelectorAll('.bento-card.feature, .bento-card.span-3, .guide-card');
    tiltables.forEach(el => {
      el.classList.add('tilt-host');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
        el.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- TOC scrollspy (article page) ---------- */
  const tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length) {
    const headings = [...tocLinks].map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const active = [...tocLinks].find(l => l.getAttribute('href') === '#' + e.target.id);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-120px 0px -70% 0px' });
    headings.forEach(h => spy.observe(h));
  }

  /* ---------- GSAP intro timeline ---------- */
  if (!reduced && window.gsap) {
    try {
      if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.eyebrow',      { opacity: 1, duration: 0.5 }, 0.2)
        .from('.eyebrow',    { y: 16, duration: 0.5 }, 0.2)
        .to('.hero-title',   { opacity: 1, duration: 0.8 }, 0.45)
        .from('.hero-title', { y: 42, duration: 0.8 }, 0.45)
        .to('.hero-sub',     { opacity: 1, duration: 0.7 }, 0.75)
        .from('.hero-sub',   { y: 20, duration: 0.7 }, 0.75)
        .to('.hero-cta-row', { opacity: 1, duration: 0.55 }, 1.0)
        .from('.hero-cta-row',{ y: 14, duration: 0.55 }, 1.0)
        .to('.hero-metrics', { opacity: 1, duration: 0.6 }, 1.15)
        .from('.hero-metrics',{ y: 20, duration: 0.6 }, 1.15);

      if (window.ScrollTrigger) {
        gsap.utils.toArray('.reveal-stagger > *').forEach((el, i) => {
          gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
            opacity: 0, y: 40, duration: 0.7, delay: i * 0.05, ease: 'power2.out'
          });
        });

        // Subtle parallax on metrics as user scrolls
        gsap.to('.hero-metrics', {
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
          y: -30
        });
      }
    } catch (err) {
      // Fallback if GSAP or ScrollTrigger misbehaves
      ['.eyebrow', '.hero-title', '.hero-sub', '.hero-cta-row', '.hero-metrics']
        .forEach(s => { const el = document.querySelector(s); if (el) el.style.opacity = 1; });
    }
  } else {
    ['.eyebrow', '.hero-title', '.hero-sub', '.hero-cta-row', '.hero-metrics']
      .forEach(s => { const el = document.querySelector(s); if (el) el.style.opacity = 1; });
  }

  /* ---------- Hero video loop fallback (asegura play en iOS Safari, prefers-reduced-motion) ---------- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    if (reduced) {
      // Si el usuario tiene "reducir movimiento" activo, congelar el video en su primer frame.
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    } else {
      // En navegadores que bloquean autoplay (Safari iOS), forzar play tras gesto del usuario.
      const tryPlay = () => heroVideo.play().catch(() => {});
      tryPlay();
      document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
      document.addEventListener('click', tryPlay, { once: true });
    }
  }

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Filter chips en /guias/ (categoría) ---------- */
  const filterChips = document.querySelectorAll('.filter-chip');
  if (filterChips.length) {
    const items = document.querySelectorAll('.guide-item');
    const empty = document.getElementById('emptyState');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter;
        filterChips.forEach(c => {
          const active = c === chip;
          c.classList.toggle('is-active', active);
          c.setAttribute('aria-selected', String(active));
        });
        let visible = 0;
        items.forEach(item => {
          const match = filter === 'all' || item.dataset.cat === filter;
          item.classList.toggle('is-hidden', !match);
          if (match) visible++;
        });
        if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
      });
    });
  }

})();

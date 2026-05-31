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

  /* ---------- Reveal on scroll (progressive enhancement) ----------
     Estrategia anti-pantalla-blanca:
       1. CSS por defecto: todo VISIBLE (opacity:1, sin animación)
       2. Si JS funciona y elemento está FUERA del viewport al cargar → .pre-anim (opacity:0)
          y observamos con IO para añadir .in al cruzar el viewport
       3. Si elemento ya está dentro del viewport al cargar → no se toca, se ve directo
       4. Fallback duro: si tras 2s todavía hay .pre-anim sin .in, los revelamos (red de seguridad)
     Esto resuelve el bug 2026-05-31 en que IO no se disparaba para algunos
     navegadores/contextos y la home se quedaba 90 % en blanco.
  */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });

  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const vpH = window.innerHeight;
  revealEls.forEach(el => {
    const r = el.getBoundingClientRect();
    // Solo animar elementos que estén BIEN por debajo del fold (1,3× viewport).
    // El resto se ve por defecto sin animación — prioriza visibilidad sobre efecto.
    if (r.top >= vpH * 1.3) {
      el.classList.add('pre-anim');
      io.observe(el);
    }
  });

  // Red de seguridad agresiva: si tras 600 ms siguen .pre-anim sin .in (IO no disparó),
  // revelarlos. Previene pantalla en blanco si el navegador no entrega callbacks IO
  // dentro de ese tiempo, o si JS general tiene errores aguas abajo.
  setTimeout(() => {
    document.querySelectorAll('.pre-anim:not(.in)').forEach(el => el.classList.add('in'));
  }, 600);

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

  /* ---------- GSAP intro timeline (solo si GSAP está cargado Y estamos en el home) ----------
     GSAP no se carga por defecto en hogarconectado para mantener LCP bajo.
     Si en el futuro se decide cargarlo, solo se anima si los 5 targets existen
     en la página (es decir: estamos en el home con .hero). Esto evita warnings
     "GSAP target X not found" cuando main.js se ejecuta en una pillar.
  */
  if (!reduced && window.gsap && document.querySelector('.hero .hero-title')) {
    try {
      if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.eyebrow',    { y: 16, opacity: 0, duration: 0.5 }, 0.2)
        .from('.hero-title', { y: 42, opacity: 0, duration: 0.8 }, 0.45)
        .from('.hero-sub',   { y: 20, opacity: 0, duration: 0.7 }, 0.75)
        .from('.hero-cta-row',{ y: 14, opacity: 0, duration: 0.55 }, 1.0)
        .from('.hero-metrics',{ y: 20, opacity: 0, duration: 0.6 }, 1.15);
    } catch (err) {
      // Si GSAP rompe, no pasa nada: el CSS ya tiene opacity:1 por defecto
    }
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

  /* ---------- Smooth anchor scroll + focus management for skip-link ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      if (target.hasAttribute('tabindex') || target.tagName === 'MAIN') {
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- Newsletter AJAX (formsubmit.co) ---------- */
  const nlForm = document.getElementById('newsletter-form');
  const nlStatus = nlForm?.querySelector('.newsletter-status');
  const nlBtn = nlForm?.querySelector('button[type="submit"]');
  if (nlForm && nlStatus && nlBtn) {
    nlForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      nlStatus.dataset.state = '';
      nlStatus.textContent = '';
      if (!nlForm.checkValidity()) {
        nlStatus.dataset.state = 'error';
        nlStatus.textContent = 'Introduce un email válido.';
        return;
      }
      nlBtn.setAttribute('aria-busy', 'true');
      const original = nlBtn.textContent;
      nlBtn.textContent = 'Enviando…';
      try {
        const res = await fetch(nlForm.action, {
          method: 'POST',
          body: new FormData(nlForm),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Network');
        nlStatus.dataset.state = 'success';
        nlStatus.textContent = 'Suscrito. Te llega un email de confirmación en breve.';
        nlForm.reset();
      } catch {
        nlStatus.dataset.state = 'error';
        nlStatus.textContent = 'No se pudo enviar. Escribe a demadrazobruno@gmail.com.';
      } finally {
        nlBtn.removeAttribute('aria-busy');
        nlBtn.textContent = original;
      }
    });
    if (new URLSearchParams(location.search).get('subscribed') === '1') {
      nlStatus.dataset.state = 'success';
      nlStatus.textContent = 'Suscrito. Te llega un email de confirmación en breve.';
      history.replaceState({}, '', location.pathname);
    }
  }

  /* ---------- Magnetic CTA (sólo punteros finos; sutil pull hacia el cursor) ---------- */
  if (!reduced && !isCoarse) {
    const magneticBtns = document.querySelectorAll('.btn-primary, .nav-cta');
    magneticBtns.forEach(btn => {
      let raf = 0;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;  // -0.5..0.5
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.transform = `translate(${dx * 6}px, ${dy * 4 - 2}px)`;
        });
      });
      btn.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Sticky mobile CTA (mostrar tras hero, ocultar al ver calc o footer) ---------- */
  const stickyCta = document.querySelector('[data-sticky-cta]');
  if (stickyCta) {
    const calcSection = document.getElementById('calculadora');
    const footer = document.querySelector('.site-footer');
    let pastHero = false;
    let inHideZone = false;

    const updateVisibility = () => {
      const shouldShow = pastHero && !inHideZone;
      if (shouldShow) {
        stickyCta.hidden = false;
        // siguiente tick para que la transición pille el cambio de hidden
        requestAnimationFrame(() => stickyCta.classList.add('is-visible'));
      } else {
        stickyCta.classList.remove('is-visible');
      }
    };

    // Mostrar cuando salimos del hero
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          pastHero = !e.isIntersecting;
          updateVisibility();
        });
      }, { threshold: 0, rootMargin: '-60% 0px 0px 0px' });
      heroObs.observe(hero);
    } else {
      pastHero = true;
    }

    // Ocultar cuando el visitante ya está en la calculadora o en el footer (no compita con CTA propio del bloque)
    const hideTargets = [calcSection, footer].filter(Boolean);
    if (hideTargets.length) {
      const hideObs = new IntersectionObserver((entries) => {
        // si alguno entra, ocultar
        inHideZone = entries.some(e => e.isIntersecting) ||
                     hideTargets.some(t => {
                       const r = t.getBoundingClientRect();
                       return r.top < window.innerHeight * 0.6 && r.bottom > 0;
                     });
        updateVisibility();
      }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
      hideTargets.forEach(t => hideObs.observe(t));
    }
  }

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

/* ==========================================================================
   hogarconectado.co — main.js
   - Three.js smart-home connected network hero (enhanced)
   - GSAP intro timeline + ScrollTrigger reveals
   - Header scroll state + mobile menu (escape / outside-click)
   - Year stamp + TOC scrollspy
   - Cursor spotlight for cards, count-up metrics, 3D card tilt
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
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Count-up for hero metrics ---------- */
  const countUp = (el, target, suffix = '', duration = 1400) => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  };
  const metricObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      metricObs.unobserve(el);
      const raw = (el.textContent || '').trim();
      const m = raw.match(/^([+]?)(\d+)(.*)$/);
      if (m) {
        const prefix = m[1];
        const num = parseInt(m[2], 10);
        const suffix = m[3];
        el.textContent = prefix + '0' + suffix;
        setTimeout(() => countUp(el, num, suffix, 1300), 60);
        if (prefix) el.dataset.prefix = prefix;
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

  /* ---------- Three.js connected network hero (enhanced) ---------- */
  const canvas = document.getElementById('hero-canvas');
  if (canvas && window.THREE && !reduced) {
    try { initNetwork(canvas); }
    catch (err) { console.warn('Hero canvas disabled:', err); }
  }

  function initNetwork(host) {
    const width  = () => host.clientWidth  || window.innerWidth;
    const height = () => host.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width()/height(), 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    host.appendChild(renderer.domElement);

    const NODE_COUNT = isCoarse ? 42 : 72;
    const nodes = [];
    const nodeGeo = new THREE.IcosahedronGeometry(0.09, 0);

    const group = new THREE.Group();
    scene.add(group);

    // Color palette: cyan to violet
    const colorA = new THREE.Color(0x22d3ee);
    const colorB = new THREE.Color(0xa855f7);

    for (let i = 0; i < NODE_COUNT; i++) {
      const mix = Math.random();
      const c = colorA.clone().lerp(colorB, mix);
      const mat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.95 });
      const node = new THREE.Mesh(nodeGeo, mat);
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 3.2 + Math.random() * 0.8;
      node.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi) * 0.6
      );
      node.userData = {
        base: node.position.clone(),
        speed: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        color: c
      };
      group.add(node);
      nodes.push(node);

      if (i % 4 === 0) {
        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 16, 16),
          new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.18 })
        );
        glow.position.copy(node.position);
        glow.userData = node.userData;
        glow.userData.isGlow = true;
        group.add(glow);
        nodes.push(glow);
      }
    }

    /* Connecting lines with vertex colors for subtle gradient */
    const linePositions = [];
    const lineColors = [];
    const maxDist = 1.9;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].userData.isGlow) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[j].userData.isGlow) continue;
        const d = nodes[i].position.distanceTo(nodes[j].position);
        if (d < maxDist) {
          linePositions.push(
            nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
            nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
          );
          const a = (1 - d / maxDist) * 0.8;
          const ca = nodes[i].userData.color;
          const cb = nodes[j].userData.color;
          lineColors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.45 });
    const lineSegs = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lineSegs);

    /* Central core — wireframe icosphere + glow */
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.55 })
    );
    group.add(core);

    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.12 })
    );
    group.add(coreGlow);

    /* Interaction */
    let mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const resize = () => {
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
      renderer.setSize(width(), height());
    };
    window.addEventListener('resize', resize);

    /* Pause when offscreen or tab hidden */
    let visible = true;
    const visIo = new IntersectionObserver((entries) => {
      entries.forEach(e => visible = e.isIntersecting);
    }, { threshold: 0 });
    visIo.observe(host);
    document.addEventListener('visibilitychange', () => { visible = !document.hidden && visible; });

    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      const t = clock.getElapsedTime();

      tx += (mx * 0.35 - tx) * 0.05;
      ty += (my * 0.2  - ty) * 0.05;
      group.rotation.y = tx + t * 0.05;
      group.rotation.x = -ty;

      core.rotation.x = t * 0.25;
      core.rotation.y = t * 0.4;
      const corePulse = 1 + Math.sin(t * 1.5) * 0.06;
      core.scale.setScalar(corePulse);
      coreGlow.scale.setScalar(corePulse * 1.05);

      nodes.forEach(n => {
        const u = n.userData;
        n.material.opacity = u.isGlow
          ? 0.12 + 0.08 * Math.sin(t * u.speed + u.phase)
          : 0.7 + 0.3 * Math.sin(t * u.speed + u.phase);
      });

      renderer.render(scene, camera);
    })();
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
})();

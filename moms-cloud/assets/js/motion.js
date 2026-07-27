/* ==========================================================================
   Mom's Cloud · motion.js
   Capa de animación. Es OPCIONAL por diseño: la página es completamente
   legible y usable sin este archivo.

   CONTRATO DE ARRANQUE (no relajar sin muy buen motivo)
   -----------------------------------------------------
   El CSS nunca oculta contenido. Solo este archivo puede hacerlo, y solo
   después de comprobar que:
     1. gsap, ScrollTrigger y Lenis existen de verdad
     2. el usuario no ha pedido movimiento reducido
     3. el elemento está por debajo del pliegue (lo visible no se toca)
     4. nada ha lanzado una excepción — todo va dentro de try/catch
   Además se arma una red de seguridad temporal que revela todo pasados
   900 ms. En ningún escenario el usuario puede quedarse mirando una
   página en blanco.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var lenis = null;
  var safety = null;

  /** Devuelve todo a su estado visible y desmonta la capa de animación. */
  function revealAll() {
    root.classList.remove('mc-anim-ready');
    document.querySelectorAll('.mc-reveal').forEach(function (el) {
      el.classList.add('mc-in');
    });
  }

  function teardown() {
    try {
      if (lenis) { lenis.destroy(); lenis = null; }
      if (window.ScrollTrigger) window.ScrollTrigger.killAll();
      if (window.gsap) window.gsap.globalTimeline.clear();
    } catch (e) { /* desmontar nunca debe romper la página */ }
    revealAll();
  }

  /* ---------- Comprobaciones 1 y 2 del contrato ---------- */
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) return;
  if (reduceQuery.matches) return;

  // Si el usuario activa "reducir movimiento" con la página abierta.
  var onPrefChange = function (e) { if (e.matches) teardown(); };
  if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', onPrefChange);

  /* ------------------------------------------------------------------ *
   * El trabajo pesado se aplaza hasta después del primer pintado, para
   * no cargar el hilo principal mientras el navegador dibuja el hero.
   * ------------------------------------------------------------------ */
  var defer = window.requestIdleCallback || function (cb) { return setTimeout(cb, 1); };
  requestAnimationFrame(function () {
    defer(init, { timeout: 300 });
  });

  function init() {
    try {
      var gsap = window.gsap;
      var ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      if (window.SplitText) gsap.registerPlugin(window.SplitText);

      /* -------------------------------------------------------------- *
       * Red de seguridad: si algo se atasca, todo vuelve a ser visible.
       * Se arma ANTES de ocultar nada.
       * -------------------------------------------------------------- */
      safety = setTimeout(revealAll, 900);

      /* -------------------------------------------------------------- *
       * Comprobación 3: solo se oculta lo que está bajo el pliegue.
       * -------------------------------------------------------------- */
      var threshold = window.innerHeight * 1.25;
      var reveals = Array.prototype.slice.call(document.querySelectorAll('.mc-reveal'));
      var deferred = [];

      root.classList.add('mc-anim-ready');
      reveals.forEach(function (el) {
        if (el.getBoundingClientRect().top < threshold) el.classList.add('mc-in');
        else deferred.push(el);
      });

      /* -------------------------------------------------------------- *
       * Scroll suavizado (Lenis) enganchado al ticker de GSAP.
       * Sin esto, ScrollTrigger y Lenis usan relojes distintos y el
       * scrub va a destiempo.
       * -------------------------------------------------------------- */
      lenis = new window.Lenis({
        lerp: 0.09,
        smoothWheel: true,
        // En táctil el scroll suavizado pelea con el rebote nativo de iOS
        // y se siente peor que el del sistema. Se deja el nativo.
        syncTouch: false
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);

      // Anclas internas a través de Lenis, con hueco para la nav fija.
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (ev) {
          var id = a.getAttribute('href');
          if (!id || id === '#') return;
          var target = document.querySelector(id);
          if (!target) return;
          ev.preventDefault();
          lenis.scrollTo(target, { offset: -80 });
        });
      });

      /* -------------------------------------------------------------- *
       * Revelados
       * -------------------------------------------------------------- */
      deferred.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: function () { el.classList.add('mc-in'); }
        });
      });

      // Escalonado dentro de cada rejilla de producto.
      document.querySelectorAll('.mc-grid').forEach(function (grid) {
        var cards = grid.querySelectorAll('.mc-card');
        ScrollTrigger.create({
          trigger: grid,
          start: 'top 86%',
          once: true,
          onEnter: function () {
            cards.forEach(function (card, i) {
              setTimeout(function () { card.classList.add('mc-in'); }, i * 70);
            });
          }
        });
      });

      /* -------------------------------------------------------------- *
       * Hero: las letras se posan una a una
       * -------------------------------------------------------------- */
      var word = document.querySelector('[data-split]');
      if (word && window.SplitText) {
        document.fonts.ready.then(function () {
          try {
            var split = new window.SplitText(word, { type: 'chars', aria: 'auto' });
            gsap.from(split.chars, {
              yPercent: -120,
              opacity: 0,
              duration: 0.9,
              ease: 'back.out(1.7)',
              stagger: 0.045
            });
          } catch (e) { /* si falla, el titular ya es visible */ }
          ScrollTrigger.refresh();
        });
      }

      /* -------------------------------------------------------------- *
       * Hero: el titular engorda al hacer scroll.
       * Se anima un objeto intermedio y se escribe una custom property,
       * porque font-variation-settings no interpola de forma fiable
       * entre navegadores.
       * -------------------------------------------------------------- */
      if (word) {
        var weight = { v: 700 };
        gsap.to(weight, {
          v: 300,
          ease: 'none',
          scrollTrigger: { trigger: '.mc-hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
          onUpdate: function () { word.style.setProperty('--mc-w', Math.round(weight.v)); }
        });
      }

      /* -------------------------------------------------------------- *
       * El wobble: la palabra tiembla según lo rápido que scrolleas y se
       * estabiliza al parar. Es el gesto del propio producto.
       * -------------------------------------------------------------- */
      var wob = document.querySelector('[data-wobble]');
      if (wob) {
        var setSkew  = gsap.quickTo(wob, 'skewY',  { duration: 0.7, ease: 'elastic.out(1, 0.3)' });
        var setScale = gsap.quickTo(wob, 'scaleY', { duration: 0.7, ease: 'elastic.out(1, 0.3)' });

        ScrollTrigger.create({
          trigger: wob,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: function (self) {
            var v = gsap.utils.clamp(-90, 90, self.getVelocity() / 42);
            setSkew(v * 0.12);
            setScale(1 + Math.abs(v) * 0.0022);
          },
          onLeave:     function () { setSkew(0); setScale(1); },
          onLeaveBack: function () { setSkew(0); setScale(1); }
        });
      }

      /* -------------------------------------------------------------- *
       * Parallax suave, solo en pantallas grandes con puntero fino.
       * -------------------------------------------------------------- */
      gsap.matchMedia().add('(min-width: 960px) and (hover: hover)', function () {
        gsap.to('.mc-hero__media', {
          yPercent: -9,
          ease: 'none',
          scrollTrigger: { trigger: '.mc-hero', start: 'top top', end: 'bottom top', scrub: 1.1 }
        });
        gsap.to('.mc-hero__glow', {
          yPercent: 16,
          ease: 'none',
          scrollTrigger: { trigger: '.mc-hero', start: 'top top', end: 'bottom top', scrub: 1.4 }
        });
        gsap.to('.mc-footer__word', {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: { trigger: '.mc-footer', start: 'top bottom', end: 'bottom bottom', scrub: 1 }
        });
      });

      /* -------------------------------------------------------------- *
       * Carrusel: modo fijado, solo en escritorio con puntero fino.
       *
       * La sección se queda quieta y el scroll vertical escribe el
       * scrollLeft de la pista. Se escribe scrollLeft en lugar de mover
       * la pista con transform porque la pista YA es un contenedor
       * desplazable: moverla por CSS y por scroll a la vez daría tirones.
       * En móvil no se activa nada de esto y manda el deslizamiento
       * nativo, que es lo que la gente espera con el dedo.
       * -------------------------------------------------------------- */
      gsap.matchMedia().add('(min-width: 900px) and (hover: hover)', function () {
        var rails = Array.prototype.slice.call(document.querySelectorAll('[data-rail]'));
        var creados = [];
        var previos = [];

        root.classList.add('mc-rail-pin');

        rails.forEach(function (rail) {
          var api = rail.mcRail;
          if (!api) return;
          var track = api.track;
          var n = api.slides.length;
          var seccion = rail.closest('section') || rail;

          var recorrido = function () {
            return Math.max(1, track.scrollWidth - track.clientWidth);
          };

          var st = ScrollTrigger.create({
            trigger: seccion,
            start: 'top top',
            end: function () { return '+=' + Math.round(recorrido() * 1.15); },
            pin: seccion,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.55,
            snap: {
              snapTo: 1 / (n - 1),
              duration: { min: 0.15, max: 0.4 },
              ease: 'power2.inOut'
            },
            onUpdate: function (self) {
              track.scrollLeft = self.progress * recorrido();
              api.update();
            },
            onRefresh: function () { api.update(); }
          });
          creados.push(st);

          // En modo fijado quien manda es el scroll de la ventana, así que
          // los botones tienen que mover la ventana, no la pista.
          previos.push([rail, api.irA]);
          api.irA = function (i) {
            var destino = Math.max(0, Math.min(n - 1, i));
            var y = st.start + (destino / (n - 1)) * (st.end - st.start);
            if (lenis) lenis.scrollTo(y, { duration: 0.7 });
            else window.scrollTo({ top: y, behavior: 'smooth' });
          };
        });

        // Limpieza al salir del rango: vuelve el carrusel nativo.
        return function () {
          root.classList.remove('mc-rail-pin');
          creados.forEach(function (st) { st.kill(); });
          previos.forEach(function (p) { if (p[0].mcRail) p[0].mcRail.irA = p[1]; });
        };
      });

      /* -------------------------------------------------------------- *
       * Recalcular cuando cambian las métricas reales.
       * -------------------------------------------------------------- */
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

      var resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
      }, { passive: true });

      // Todo montado: la red de seguridad ya no hace falta.
      clearTimeout(safety);

    } catch (err) {
      // Comprobación 4: ante cualquier fallo, la página se ve entera.
      if (safety) clearTimeout(safety);
      revealAll();
      if (window.console && console.warn) {
        console.warn("Mom's Cloud · animación desactivada:", err);
      }
    }
  }
})();

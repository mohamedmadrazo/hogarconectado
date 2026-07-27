/* ==========================================================================
   Mom's Cloud · app.js
   Comportamiento base de la página. NO depende de GSAP ni de Lenis: si
   motion.js no llega a cargar, todo lo de aquí sigue funcionando.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Año del footer
   * ------------------------------------------------------------------ */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------------ *
   * Hora local del negocio
   * El local está en Logroño. Si calculásemos con la hora del visitante,
   * alguien mirando la web desde otro huso vería "abierto" cuando está
   * cerrado. Se resuelve siempre en Europe/Madrid.
   * ------------------------------------------------------------------ */
  var DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function businessNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Madrid',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(new Date());

      var out = {};
      parts.forEach(function (p) { out[p.type] = p.value; });

      var hour = parseInt(out.hour, 10);
      if (hour === 24) hour = 0;              // algunos motores devuelven 24
      return {
        day: DAY_INDEX[out.weekday],
        mins: hour * 60 + parseInt(out.minute, 10)
      };
    } catch (e) {
      // Sin soporte de zonas horarias: se cae a la hora del dispositivo.
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function toMins(hhmm) {
    var p = hhmm.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function fmt(mins) {
    var m = mins % (24 * 60);
    var h = Math.floor(m / 60);
    return (h < 10 ? '0' : '') + h + ':' + (m % 60 < 10 ? '0' : '') + (m % 60);
  }

  /* ------------------------------------------------------------------ *
   * Horario: el DOM es la fuente de verdad
   * Se leen data-days y data-ranges de la propia lista visible, así el
   * horario que se muestra y el que se calcula no pueden divergir.
   * ------------------------------------------------------------------ */
  function readSchedule() {
    var list = document.querySelector('[data-hours]');
    if (!list) return null;

    var byDay = {};                                   // 0..6 → [[ini, fin], …]
    Array.prototype.forEach.call(list.children, function (li) {
      var days = (li.getAttribute('data-days') || '').split(',').filter(Boolean);
      var raw = (li.getAttribute('data-ranges') || '').trim();
      var ranges = raw
        ? raw.split(',').map(function (r) {
            var pair = r.split('-');
            return [toMins(pair[0]), toMins(pair[1])];
          })
        : [];
      days.forEach(function (d) { byDay[parseInt(d, 10)] = { ranges: ranges, el: li }; });
    });
    return byDay;
  }

  function renderStatus() {
    var schedule = readSchedule();
    var pill = document.querySelector('[data-status]');
    if (!schedule || !pill) return;

    var now = businessNow();
    var today = schedule[now.day];

    // Resalta la fila del día en curso.
    if (today && today.el) today.el.classList.add('is-today');

    var openUntil = null;
    if (today) {
      today.ranges.forEach(function (r) {
        if (now.mins >= r[0] && now.mins < r[1]) openUntil = r[1];
      });
    }

    var text = pill.querySelector('.mc-status__text');

    if (openUntil !== null) {
      pill.classList.add('is-open');
      text.textContent = 'Abierto · cierra a las ' + fmt(openUntil);
    } else {
      pill.classList.remove('is-open');
      text.textContent = 'Cerrado · abre ' + nextOpening(schedule, now);
    }

    pill.hidden = false;
  }

  function nextOpening(schedule, now) {
    var NAMES = ['el domingo', 'el lunes', 'el martes', 'el miércoles',
                 'el jueves', 'el viernes', 'el sábado'];

    // ¿Queda algún tramo hoy?
    var today = schedule[now.day];
    if (today) {
      var later = today.ranges.filter(function (r) { return r[0] > now.mins; });
      if (later.length) return 'hoy a las ' + fmt(later[0][0]);
    }

    // Si no, el primer día siguiente con horario.
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      var entry = schedule[d];
      if (entry && entry.ranges.length) {
        var when = fmt(entry.ranges[0][0]);
        return (i === 1 ? 'mañana' : NAMES[d]) + ' a las ' + when;
      }
    }
    return 'pronto';
  }

  renderStatus();
  // El estado caduca: se refresca cada minuto por si la pestaña queda abierta.
  setInterval(renderStatus, 60000);

  /* ------------------------------------------------------------------ *
   * Carrusel de producto
   * Vive aquí y no en motion.js a propósito: no depende de GSAP, así que
   * los botones, el contador y el efecto de foco funcionan aunque la capa
   * de animación no llegue a cargar. motion.js solo añade el fijado.
   * ------------------------------------------------------------------ */
  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var track  = rail.querySelector('[data-rail-track]');
    var slides = Array.prototype.slice.call(rail.querySelectorAll('[data-slide]'));
    if (!track || slides.length < 2) return;

    var idxEl = rail.querySelector('[data-rail-index]');
    var prev  = rail.querySelector('[data-rail-prev]');
    var next  = rail.querySelector('[data-rail-next]');
    var activo = -1;

    /* El relleno lateral exacto: media pista menos medio slide.
       Calculado desde clientWidth y no desde 50vw, porque vw incluye la
       barra de scroll del sistema. Sin esto, el desplazamiento por scroll
       no cae justo sobre el centro de cada producto. */
    function medirRelleno() {
      var anchoSlide = slides[0].getBoundingClientRect().width;
      var pad = Math.max(0, (track.clientWidth - anchoSlide) / 2);
      track.style.setProperty('--mc-rail-pad', pad.toFixed(2) + 'px');
    }
    medirRelleno();

    function update() {
      var centro = window.innerWidth / 2;
      var alcance = window.innerWidth * 0.42;   // a partir de aquí, foco 0
      var mejor = 0, menorDist = Infinity;

      slides.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var d = Math.abs((r.left + r.width / 2) - centro);
        var f = Math.max(0, 1 - d / alcance);
        // Curva suave: el foco cae rápido al salir del centro.
        s.style.setProperty('--f', (f * f * (3 - 2 * f)).toFixed(3));
        if (d < menorDist) { menorDist = d; mejor = i; }
      });

      if (mejor !== activo) {
        activo = mejor;
        if (idxEl) idxEl.textContent = String(mejor + 1);
        if (prev) prev.disabled = mejor === 0;
        if (next) next.disabled = mejor === slides.length - 1;
      }
    }

    var esperando = false;
    function programar() {
      if (esperando) return;
      esperando = true;
      window.requestAnimationFrame(function () { update(); esperando = false; });
    }

    // El scroll de la pista mueve los slides; el de la ventana también
    // cuenta, porque con la sección fijada el centro se recalcula igual.
    track.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', function () { medirRelleno(); programar(); }, { passive: true });
    // El relleno depende del ancho del slide, que depende de la fuente ya
    // cargada. Se vuelve a medir cuando las métricas son las definitivas.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { medirRelleno(); programar(); });
    }

    // API pública del carrusel. motion.js sustituye irA() al activar el
    // modo fijado, porque allí quien manda es el scroll de la ventana.
    rail.mcRail = {
      track: track,
      slides: slides,
      update: update,
      indice: function () { return activo; },
      irA: function (i) {
        var s = slides[Math.max(0, Math.min(slides.length - 1, i))];
        if (s && s.scrollIntoView) {
          s.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    };

    if (prev) prev.addEventListener('click', function () { rail.mcRail.irA(activo - 1); });
    if (next) next.addEventListener('click', function () { rail.mcRail.irA(activo + 1); });

    update();
  });

  // Solo ahora se muestran los controles: sin JS serían botones muertos.
  if (document.querySelector('[data-rail]')) {
    document.documentElement.classList.add('mc-rail-js');
  }

  /* ------------------------------------------------------------------ *
   * Nav: se esconde al bajar, reaparece al subir
   * ------------------------------------------------------------------ */
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var lastY = window.scrollY;
    var ticking = false;

    var onScroll = function () {
      var y = window.scrollY;
      nav.classList.toggle('is-stuck', y > 8);

      // Solo se esconde una vez pasado el hero, y nunca durante un foco por
      // teclado (el usuario podría estar tabulando hacia el CTA de la nav).
      if (!nav.contains(document.activeElement)) {
        if (y > 420 && y > lastY + 6) nav.classList.add('is-hidden');
        else if (y < lastY - 6) nav.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });

    onScroll();
  }
})();

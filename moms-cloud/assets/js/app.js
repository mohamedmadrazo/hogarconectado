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

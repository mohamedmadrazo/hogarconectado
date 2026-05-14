/* ==========================================================================
   Cookie Consent Banner — Hogar Conectado
   GDPR / LOPDGDD compliant · Google Consent Mode v2 ready
   Vanilla JS · zero dependencies · <2KB gzipped
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'hc_consent';
  var STORAGE_VERSION = 'v1';
  var EXPIRES_DAYS = 180;

  // ---------- Google Consent Mode v2 default (deny all) -----------------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  // ---------- Storage helpers -------------------------------------------
  function getSaved() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.v !== STORAGE_VERSION) return null;
      if (data.exp && Date.now() > data.exp) return null;
      return data;
    } catch (e) { return null; }
  }

  function save(choice) {
    var payload = {
      v: STORAGE_VERSION,
      ts: Date.now(),
      exp: Date.now() + EXPIRES_DAYS * 86400000,
      analytics: !!choice.analytics,
      ads: !!choice.ads
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (e) {}
    applyConsent(payload);
    window.dispatchEvent(new CustomEvent('hc:consent', { detail: payload }));
  }

  function applyConsent(c) {
    gtag('consent', 'update', {
      ad_storage: c.ads ? 'granted' : 'denied',
      ad_user_data: c.ads ? 'granted' : 'denied',
      ad_personalization: c.ads ? 'granted' : 'denied',
      analytics_storage: c.analytics ? 'granted' : 'denied'
    });
  }

  // ---------- UI ---------------------------------------------------------
  function inject(html) {
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstElementChild);
  }

  function showBanner() {
    if (document.getElementById('hc-cc')) return;
    inject(bannerHTML());
    wire();
    requestAnimationFrame(function () {
      document.getElementById('hc-cc').classList.add('is-open');
    });
  }

  function hideBanner() {
    var b = document.getElementById('hc-cc');
    if (!b) return;
    b.classList.remove('is-open');
    setTimeout(function () { b.remove(); }, 280);
  }

  function bannerHTML() {
    return '' +
      '<div id="hc-cc" class="hc-cc" role="dialog" aria-live="polite" aria-label="Aviso de cookies">' +
        '<div class="hc-cc__inner">' +
          '<div class="hc-cc__body">' +
            '<strong>Usamos cookies</strong>' +
            '<p>Usamos cookies propias y de terceros para analítica y publicidad. Puedes aceptar todas, rechazar las no esenciales o personalizar tu elección. Más información en nuestra <a href="/cookies.html">política de cookies</a>.</p>' +
          '</div>' +
          '<div class="hc-cc__actions">' +
            '<button type="button" class="hc-cc__btn hc-cc__btn--ghost" data-cc="reject">Rechazar</button>' +
            '<button type="button" class="hc-cc__btn hc-cc__btn--ghost" data-cc="custom">Personalizar</button>' +
            '<button type="button" class="hc-cc__btn hc-cc__btn--primary" data-cc="accept">Aceptar todo</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function modalHTML(c) {
    c = c || { analytics: true, ads: true };
    return '' +
      '<div id="hc-cm" class="hc-cm" role="dialog" aria-modal="true" aria-labelledby="hc-cm-title">' +
        '<div class="hc-cm__scrim" data-cc="close"></div>' +
        '<div class="hc-cm__card">' +
          '<header class="hc-cm__head">' +
            '<h2 id="hc-cm-title">Preferencias de cookies</h2>' +
            '<button type="button" class="hc-cm__x" data-cc="close" aria-label="Cerrar">×</button>' +
          '</header>' +
          '<div class="hc-cm__body">' +
            '<div class="hc-cm__row"><div><strong>Esenciales</strong><p>Necesarias para el funcionamiento del sitio. No se pueden desactivar.</p></div><span class="hc-cm__tag">Siempre activas</span></div>' +
            '<label class="hc-cm__row"><div><strong>Analítica</strong><p>Medimos visitas de forma agregada para mejorar el contenido.</p></div><input type="checkbox" data-cc-cat="analytics" ' + (c.analytics ? 'checked' : '') + '></label>' +
            '<label class="hc-cm__row"><div><strong>Publicidad</strong><p>Anuncios personalizados de Google AdSense basados en tu navegación.</p></div><input type="checkbox" data-cc-cat="ads" ' + (c.ads ? 'checked' : '') + '></label>' +
          '</div>' +
          '<footer class="hc-cm__foot">' +
            '<button type="button" class="hc-cc__btn hc-cc__btn--ghost" data-cc="reject">Rechazar todo</button>' +
            '<button type="button" class="hc-cc__btn hc-cc__btn--primary" data-cc="save">Guardar elección</button>' +
          '</footer>' +
        '</div>' +
      '</div>';
  }

  function wire() {
    document.addEventListener('click', onClick, { capture: true });
  }

  function onClick(e) {
    var t = e.target.closest('[data-cc]');
    if (!t) return;
    var action = t.getAttribute('data-cc');
    if (action === 'accept') { save({ analytics: true, ads: true }); hideBanner(); closeModal(); }
    else if (action === 'reject') { save({ analytics: false, ads: false }); hideBanner(); closeModal(); }
    else if (action === 'custom') { openModal(); }
    else if (action === 'close') { closeModal(); }
    else if (action === 'save') {
      var a = !!document.querySelector('[data-cc-cat="analytics"]:checked');
      var d = !!document.querySelector('[data-cc-cat="ads"]:checked');
      save({ analytics: a, ads: d });
      hideBanner();
      closeModal();
    }
  }

  function openModal() {
    if (document.getElementById('hc-cm')) return;
    inject(modalHTML(getSaved()));
    requestAnimationFrame(function () {
      document.getElementById('hc-cm').classList.add('is-open');
    });
  }

  function closeModal() {
    var m = document.getElementById('hc-cm');
    if (!m) return;
    m.classList.remove('is-open');
    setTimeout(function () { m.remove(); }, 220);
  }

  // ---------- Public API -------------------------------------------------
  window.HCConsent = {
    open: function () { openModal(); },
    get: function () { return getSaved(); },
    reset: function () { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} location.reload(); }
  };

  // ---------- Boot -------------------------------------------------------
  var saved = getSaved();
  if (saved) {
    applyConsent(saved);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();

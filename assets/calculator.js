/* ==========================================================================
   Calculadora · "¿Cuánto te ahorra automatizar tu casa?"
   Vanilla JS · zero dependencies · ~3 KB
   Lógica calibrada con datos reales de las 3 viviendas de prueba 2025-26.
   ========================================================================== */
(function () {
  'use strict';

  // ---- DOM ----
  var m2El      = document.getElementById('calc-m2');
  var m2Val     = document.getElementById('calc-m2-val');
  var heatEl    = document.getElementById('calc-heat');
  var petEl     = document.getElementById('calc-pet');
  var budgetEl  = document.getElementById('calc-budget');
  var saveEl    = document.getElementById('calc-saving');
  var paybackEl = document.getElementById('calc-payback');
  var percentEl = document.getElementById('calc-percent');
  var recsEl    = document.getElementById('calc-recs');

  if (!m2El || !heatEl || !budgetEl || !recsEl) return; // si no existe la sección, salir limpiamente

  // ---- Catálogo de guías para recomendaciones ----
  var GUIDES = {
    enchufes: {
      title: 'Enchufes con medidor',
      desc: 'Ahorro PVPC tramo valle. Tapo P110 a 13 €.',
      href: '/guias/mejores-enchufes-inteligentes-2026.html',
      icon: 'plug'
    },
    bombillas: {
      title: 'Bombillas inteligentes',
      desc: 'CRI medido. Aqara T2 lidera a Hue por la mitad.',
      href: '/guias/mejores-bombillas-inteligentes-2026.html',
      icon: 'bulb'
    },
    termostato: {
      title: 'Termostato inteligente',
      desc: 'Tado° X, Netatmo, Honeywell evohome.',
      href: '/guias/mejores-termostatos-inteligentes-2026.html',
      icon: 'thermo'
    },
    persianas: {
      title: 'Persianas automatizadas',
      desc: '-27 % consumo A/C verano Madrid medido.',
      href: '/guias/mejores-persianas-inteligentes-2026.html',
      icon: 'shutter'
    },
    cerradura: {
      title: 'Cerradura inteligente',
      desc: 'Nuki, Aqara, Tedee. Sin cambiar la puerta.',
      href: '/guias/mejores-cerraduras-inteligentes-2026.html',
      icon: 'lock'
    },
    alarma: {
      title: 'Alarma de hogar',
      desc: '8 sistemas con y sin cuota probados 4 sem.',
      href: '/guias/mejores-alarmas-hogar-2026.html',
      icon: 'shield'
    },
    camara: {
      title: 'Cámaras de seguridad',
      desc: 'Eufy, Reolink, Tapo. Sin suscripción mensual.',
      href: '/guias/mejores-camaras-seguridad-2026.html',
      icon: 'camera'
    },
    robot: {
      title: 'Robot aspiradora',
      desc: 'Roborock, Dreame para hogares con mascotas.',
      href: '/guias/mejores-robots-aspiradora-2026.html',
      icon: 'robot'
    },
    asistente: {
      title: 'Elegir ecosistema',
      desc: 'Alexa vs Google vs HomeKit. 500 comandos.',
      href: '/guias/alexa-vs-google-home-vs-homekit-2026.html',
      icon: 'voice'
    }
  };

  // Icons como SVG paths (minimal stroke style)
  var ICONS = {
    plug:    '<rect x="9" y="2" width="6" height="11" rx="1"/><path d="M10 2v2M14 2v2M12 13v5"/><circle cx="12" cy="20" r="2"/>',
    bulb:    '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 3 2 5 3 6v3h8v-3c1-1 3-3 3-6a7 7 0 0 0-7-7z"/>',
    thermo:  '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    shutter: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>',
    lock:    '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    shield:  '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    camera:  '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    robot:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
    voice:   '<path d="M12 1v6m0 6v6M1 12h6m6 0h6"/><circle cx="12" cy="12" r="3"/>'
  };

  // ---- Lógica de cálculo ----
  // Datos calibrados con mediciones reales 2025-26:
  // - Termostato gas natural: 15 % * (factura invierno) ≈ 81 €/año
  // - Enchufes PVPC valle: ~60-120 €/año según uso (lavadora/lavavajillas/termo)
  // - Persianas bajada automática verano: -27 % consumo A/C ≈ €1/m² aprox
  function compute() {
    var m2     = parseInt(m2El.value, 10);
    var heat   = heatEl.value;
    var pet    = petEl.value;
    var budget = parseInt(budgetEl.value, 10);

    // Termostato (solo a partir de presupuesto Recomendado 500€)
    var termo = 0;
    if (budget >= 500) {
      termo = heat === 'gas'  ? 81
            : heat === 'elec' ? 63
            : heat === 'aero' ? 30
            : 0;
    }

    // Enchufes con medidor (siempre, escala con presupuesto)
    var ench = budget === 200 ? 40
             : budget === 500 ? 80
             : 120;  // 1000+

    // Persianas (solo Recomendado o Pro, escala con m²)
    var pers = 0;
    if (budget >= 500) {
      pers = Math.min(120, Math.round(m2 * 0.7));
    }

    var saving = termo + ench + pers;

    // Amortización: presupuesto / ahorro anual (años, redondeado a 1 decimal)
    var payback = saving > 0 ? (budget / saving).toFixed(1) : '—';

    // Porcentaje sobre factura típica española anual (electricidad + gas)
    // Vivienda media España 2026: ~1.300 €/año combinado
    var billBase = (heat === 'gas')   ? 1300
                 : (heat === 'elec')  ? 1450
                 : (heat === 'aero')  ? 1100
                 :                       800;
    var percent = Math.round(saving / billBase * 100);
    if (percent > 30) percent = 30; // techo realista

    // Actualizar números
    saveEl.textContent    = saving.toLocaleString('es-ES');
    paybackEl.textContent = payback === '—' ? '—' : String(payback).replace('.', ',');
    percentEl.textContent = percent;

    // Recomendaciones según presupuesto + factores
    var recs = recommendFor(budget, heat, pet);
    renderRecs(recs);
  }

  function recommendFor(budget, heat, pet) {
    if (budget === 200) {
      return ['enchufes', 'bombillas', 'asistente'];
    }
    if (budget === 500) {
      var base = [];
      if (heat !== 'none') base.push('termostato');
      base.push('enchufes');
      base.push('persianas');
      if (base.length < 3) base.push('alarma');
      return base.slice(0, 3);
    }
    // 1000+
    var pro = ['cerradura', 'camara'];
    if (pet === 'yes') pro.push('robot');
    else if (heat !== 'none') pro.push('termostato');
    else pro.push('alarma');
    return pro;
  }

  function renderRecs(keys) {
    var html = keys.map(function (k) {
      var g = GUIDES[k];
      if (!g) return '';
      return '' +
        '<a class="calc-rec" href="' + g.href + '">' +
          '<span class="calc-rec-icon" aria-hidden="true">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              ICONS[g.icon] +
            '</svg>' +
          '</span>' +
          '<span class="calc-rec-body">' +
            '<span class="calc-rec-title">' + g.title + '</span>' +
            '<span class="calc-rec-desc">' + g.desc + '</span>' +
          '</span>' +
          '<span class="calc-rec-arrow" aria-hidden="true">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>' +
          '</span>' +
        '</a>';
    }).join('');
    recsEl.innerHTML = html;
  }

  // ---- Slider fill tracking (CSS variable --val) ----
  function updateSliderFill() {
    var min  = parseFloat(m2El.min)  || 40;
    var max  = parseFloat(m2El.max)  || 200;
    var val  = parseFloat(m2El.value);
    var pct  = ((val - min) / (max - min)) * 100;
    m2El.style.setProperty('--val', pct + '%');
  }

  // ---- Eventos ----
  function onM2Change() {
    m2Val.textContent = m2El.value;
    updateSliderFill();
    compute();
  }

  m2El.addEventListener('input', onM2Change);
  heatEl.addEventListener('change', compute);
  petEl.addEventListener('change', compute);
  budgetEl.addEventListener('change', compute);

  // Estado inicial al cargar
  m2Val.textContent = m2El.value;
  updateSliderFill();
  compute();
})();

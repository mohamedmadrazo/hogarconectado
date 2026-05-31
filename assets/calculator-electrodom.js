/* ==========================================================================
   Calculadora ROI por electrodoméstico — Hogar Conectado
   Inputs: lavadora, lavavajillas, A/C horas, frigorífico (clase energética)
   Outputs: coste anual actual + 3 ahorros potenciales + total
   Tarifas calibradas con PVPC 2026 (Red Eléctrica esios.ree.es)
   ========================================================================== */
(function () {
  'use strict';

  // Tarifas promedio PVPC 2026 (€/kWh)
  var TAR = {
    actual: 0.165,   // mezcla 50% llano + 30% punta + 20% valle real
    valle:  0.07,    // 00:00-08:00 + fines de semana
    punta:  0.21
  };

  // Consumos calibrados (IDAE 2024-2026 + mediciones propias)
  var W_KWH = 1.2;    // lavadora kWh/ciclo
  var D_KWH = 1.3;    // lavavajillas kWh/ciclo
  var AC_KW = 0.85;   // A/C consumo medio kW (split 9000 BTU)
  var AC_DAYS = 90;   // días de uso/año (verano España)

  // Elementos
  var washerEl = document.getElementById('cel-washer');
  var washerVal = document.getElementById('cel-washer-val');
  var dishEl = document.getElementById('cel-dishwasher');
  var dishVal = document.getElementById('cel-dishwasher-val');
  var acEl = document.getElementById('cel-ac');
  var acVal = document.getElementById('cel-ac-val');
  var fridgeEl = document.getElementById('cel-fridge');

  var costActual = document.getElementById('cel-cost-actual');
  var savingValle = document.getElementById('cel-saving-valle');
  var savingAc = document.getElementById('cel-saving-ac');
  var savingFridge = document.getElementById('cel-saving-fridge');
  var savingTotal = document.getElementById('cel-saving-total');
  var fridgeNote = document.getElementById('cel-fridge-note');
  var fridgeWrap = document.getElementById('cel-fridge-wrap');

  if (!washerEl || !dishEl || !acEl || !fridgeEl) return;

  // animateNumber con easeOutCubic (copiado idea de calculator.js)
  function animateNum(el, to, duration, formatter) {
    if (!el) return;
    var fromRaw = (el.textContent || '0').replace(/[.,\s]/g, '');
    var from = parseFloat(fromRaw) || 0;
    duration = duration || 600;
    if (Math.abs(to - from) < 0.5) {
      el.textContent = formatter ? formatter(to) : Math.round(to).toLocaleString('es-ES');
      return;
    }
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.textContent = formatter ? formatter(to) : Math.round(to).toLocaleString('es-ES');
      return;
    }
    var start = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var current = from + (to - from) * eased;
      el.textContent = formatter ? formatter(current) : Math.round(current).toLocaleString('es-ES');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function pulseResult() {
    var card = document.getElementById('cel-result');
    if (!card) return;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    card.classList.remove('is-pulsing');
    void card.offsetWidth;
    card.classList.add('is-pulsing');
  }

  function updateSliderFill(el) {
    if (!el || el.type !== 'range') return;
    var min = parseFloat(el.min) || 0;
    var max = parseFloat(el.max) || 100;
    var val = parseFloat(el.value);
    var pct = ((val - min) / (max - min)) * 100;
    el.style.setProperty('--val', pct + '%');
  }

  function compute() {
    var washerWeek = parseInt(washerEl.value, 10);
    var dishWeek = parseInt(dishEl.value, 10);
    var acHours = parseInt(acEl.value, 10);
    var fridgeKwh = parseInt(fridgeEl.value, 10);

    // Consumo anual kWh por electrodoméstico
    var washerKwhYr = washerWeek * 52 * W_KWH;
    var dishKwhYr = dishWeek * 52 * D_KWH;
    var acKwhYr = acHours * AC_DAYS * AC_KW;
    var fridgeKwhYr = fridgeKwh;
    var totalKwh = washerKwhYr + dishKwhYr + acKwhYr + fridgeKwhYr;

    // Coste anual a tarifa actual (mezcla)
    var costAct = totalKwh * TAR.actual;

    // Ahorro 1: lavadora + lavavajillas al valle (vs tarifa actual)
    // Asumimos que actualmente la mitad de los ciclos están en punta y la otra en llano
    var savValle = (washerKwhYr + dishKwhYr) * (TAR.actual - TAR.valle);

    // Ahorro 2: A/C con persiana bajada (-27% consumo medido Madrid)
    var savAc = acKwhYr * 0.27 * TAR.actual;

    // Ahorro 3: frigorífico — comparar contra clase A (110 kWh/año)
    var savFridge = (fridgeKwh - 110) * TAR.actual;
    if (savFridge < 0) savFridge = 0;

    // Mostrar valor frigorífico u ocultar la card si ya está en clase A
    if (fridgeKwh === 110) {
      fridgeWrap.textContent = '✓ Ya estás en clase A';
      fridgeWrap.style.fontSize = '1.2rem';
      fridgeNote.textContent = 'Tu frigorífico ya es eficiente. No merece la pena cambiarlo todavía.';
      savFridge = 0;
    } else {
      fridgeWrap.style.fontSize = '';
      // Restaurar estructura del span#cel-saving-fridge si fue sobrescrita
      if (!document.getElementById('cel-saving-fridge')) {
        fridgeWrap.innerHTML = '−<span id="cel-saving-fridge">0</span> €/año';
        savingFridge = document.getElementById('cel-saving-fridge');
      }
      fridgeNote.textContent = 'Pasando a clase A actual ahorrarías '
        + (fridgeKwh - 110) + ' kWh/año.';
    }

    // Animar
    animateNum(costActual, costAct);
    animateNum(savingValle, savValle);
    animateNum(savingAc, savAc);
    if (savingFridge && fridgeKwh !== 110) animateNum(savingFridge, savFridge);
    animateNum(savingTotal, savValle + savAc + savFridge);

    pulseResult();
  }

  function onSliderChange(slider, label) {
    return function () {
      label.textContent = slider.value;
      updateSliderFill(slider);
      compute();
    };
  }

  washerEl.addEventListener('input', onSliderChange(washerEl, washerVal));
  dishEl.addEventListener('input', onSliderChange(dishEl, dishVal));
  acEl.addEventListener('input', onSliderChange(acEl, acVal));
  fridgeEl.addEventListener('change', compute);

  // Estado inicial
  washerVal.textContent = washerEl.value;
  dishVal.textContent = dishEl.value;
  acVal.textContent = acEl.value;
  updateSliderFill(washerEl);
  updateSliderFill(dishEl);
  updateSliderFill(acEl);
  compute();
})();

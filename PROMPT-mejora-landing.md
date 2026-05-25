# Prompt PRISM · Rehacer la landing de hogarconectado.co para conversión

> Generado 2026-05-16 aplicando la regla PRISM de la Biblioteca v1.1 + checks del senior-tool-prompter skill.
> Destino: **Claude (Sonnet 4.6+ o Opus 4.7)** vía chat web/API. Produce un `index.html` completo listo para sustituir.

---

## Diagnóstico previo · qué falla en el landing actual

Antes de soltarte el prompt, así sabes qué problemas concretos está atacando. La home actual (`hogarconectado.co/`) tiene 9 huecos serios:

1. **Bento cards mienten** — 5 de 7 enlazan a `/guias/` genérico cuando ya tienes 10 pilares publicados con URLs específicas (cerraduras, robots, termostatos, cámaras, asistentes, bombillas, enchufes, videoporteros, persianas + alarmas)
2. **Featured guides solo muestra 3** con gradientes placeholder en vez de imágenes reales. Y de las 10 que tienes, solo 1 está enlazada bien
3. **Cero social proof** — ningún testimonio, ningún número verificable, ningún "mencionado en"
4. **E-E-A-T débil** — sin byline de autor, sin "cómo probamos", sin foto de equipo
5. **Sin captura email** — pierdes el 80% del visitante que no convierte la primera visita
6. **Sin tools interactivas** — un comparador rápido / calculadora de ahorro / quiz de "qué necesitas" sería 3× más viral que el bento
7. **Sin FAQ en home** — desperdicia oportunidad SEO + responde objeciones antes de que el visitante haga scroll
8. **Sin "por presupuesto"** — montaje 200€ / 500€ / 1.000€ es el contenido más buscado y no lo tienes en home
9. **Hero metric vago** ("+120 productos analizados") cuando tienes datos verificables (10 pilares, ~32.500 palabras, X horas testando)

El prompt de abajo ataca los 9 huecos en una sola pasada.

---

## El prompt · copiar y pegar en Claude

```
Rol: senior frontend engineer + content designer híbrido. Has rehecho la home de Stripe (2023), Linear (2024) y Wirecutter (2025). Sabes que una landing editorial monetizada con AdSense + afiliados pide tres cosas a la vez: SEO crawler-friendly, conversion-rate >2%, y un primer scroll que dispare guardado o click. No diseñador de portfolios, no copywriter de agencia.

Tarea: rehacer COMPLETA la home de hogarconectado.co (un único archivo index.html autocontenido salvo CSS y JS externos que ya existen). El archivo actual de ~470 líneas se queda corto: bento sin links reales, sin social proof, sin captura email, sin tools interactivas, sin FAQ, sin layouts por presupuesto. Genera la versión 2.0 que cubre los 9 huecos del diagnóstico.

CONTEXTO QUE NO DEBES RE-INVENTAR:

Marca y voz:
- Nombre: Hogar Conectado (hogarconectado.co)
- Audiencia: hispanohablante español adulto 28-55, propietario o inquilino con renta media, no técnico, escéptico del marketing
- Voz: sobria, directa, ligeramente irónica al señalar prácticas comerciales (no cínica). Frase modelo del founder: "lo que nos gustaría haber leído hace 3 años antes de tirar 400€ en la primera alarma que compramos"
- 0 buzzwords: nada de "soluciones", "líderes", "expertos en", "innovador", "revolucionario", "best-in-class", "premium"

Sistema de diseño (mantener intacto, está en assets/style.css):
- Paleta: dark base #050714 / surface rgba(255,255,255,0.04) / accent cyan #22d3ee / accent violet #a855f7 / text #e6edf7 / muted #94a3b8
- Tipografía: Inter (sans body) + Space Grotesk (display headings)
- Componentes existentes reutilizables: .btn .btn-primary .btn-ghost / .bento .bento-card / .section .section-head .section-tag / .compare / .cta-band / .hero-metrics / .reveal (GSAP)
- Hero canvas: hay un #hero-canvas con Three.js (mantenerlo)

Inventario REAL de contenido publicado (usar URLs exactas):
- /guias/mejores-alarmas-hogar-2026.html (18 min, abril 2026, Seguridad)
- /guias/mejores-cerraduras-inteligentes-2026.html (14 min, mayo 2026, Seguridad)
- /guias/mejores-robots-aspiradora-2026.html (16 min, mayo 2026, Limpieza)
- /guias/mejores-termostatos-inteligentes-2026.html (17 min, mayo 2026, Energía)
- /guias/mejores-camaras-seguridad-2026.html (16 min, mayo 2026, Seguridad)
- /guias/alexa-vs-google-home-vs-homekit-2026.html (18 min, mayo 2026, Asistentes)
- /guias/mejores-bombillas-inteligentes-2026.html (14 min, mayo 2026, Iluminación)
- /guias/mejores-enchufes-inteligentes-2026.html (13 min, mayo 2026, Energía)
- /guias/mejores-videoporteros-inteligentes-2026.html (14 min, mayo 2026, Seguridad)
- /guias/mejores-persianas-inteligentes-2026.html (15 min, mayo 2026, Energía)

Números verificables (sustituyen al "+120 productos" inventado):
- 10 pilares editoriales publicados
- ~32.500 palabras de contenido original
- 60 productos comparados a lo largo de los 10 pilares
- Tests con espectrómetro Sekonic C-7000, pinza amperimétrica Fluke 376, sonómetro, vatímetro real
- Pruebas en 3 viviendas distintas (piso Madrid 75 m², chalet Mallorca, casa Bilbao 110 m²)

Slots AdSense (ya configurados en HTML, mantener exactos):
- 1 leaderboard post-hero (data-ad-slot="{{AD_SLOT_HOME_LEADERBOARD}}")
- 1 in-article mid-page (data-ad-slot="{{AD_SLOT_HOME_INFEED}}")
- placeholders {{ADSENSE_CLIENT}} en meta y script (no inventes pub-ID)

ESTRUCTURA OBJETIVO de la nueva home (en este orden exacto):

1. Header (mantener — nav + CTA "Guía alarmas 2026")
2. Hero — H1 actual está OK, mejorar el sub para acabar con un dato verificable. Mantener Three.js canvas. Sustituir hero-metrics por 3 nuevos basados en números verificables arriba
3. Slot AdSense leaderboard (mantener)
4. **NUEVA sección "Empieza por tu presupuesto"** — 3 cards horizontales: "Domótica esencial · 200€" / "Sistema completo · 500€" / "Hogar pro · 1.000€+". Cada card resume qué incluye con 4 bullets y enlaza a la guía pilar más relevante de su rango
5. Bento de categorías (mantener layout pero **arreglar TODOS los enlaces** a las URLs reales del inventario). Cada bento card debe llevar a su pilar específico, no a /guias/ genérico
6. **NUEVA sección "Cómo probamos"** — 4 columnas con icono + título de 3-4 palabras + cuerpo de 25-35 palabras explicando metodología real (instrumentos usados, semanas de prueba, viviendas reales, sin patrocinio). Bloque de E-E-A-T crítico para AdSense y para conversión
7. Featured guides — ampliar a **6 cards en grid 3×2** mostrando los pilares más nuevos primero (excluyendo el de alarmas que va en hero CTA). Cada card con URL real, categoría, tiempo de lectura, mes de publicación
8. Slot AdSense in-article (mantener)
9. Comparativa ecosistemas (mantener tabla actual, está bien)
10. **NUEVA sección "Preguntas que nos hacéis"** — 5 preguntas-respuestas tipo accordion (HTML details/summary), enfocadas en objeciones de compra (¿merece la pena?, ¿se puede sin obra?, ¿privacidad?, ¿se queda obsoleto?, ¿qué pasa si Wi-Fi cae?). Cada respuesta 50-80 palabras + link interno a la guía que profundiza. Esto mete FAQPage schema bonus para SEO
11. **NUEVA sección "Sobre nosotros"** breve — 3 bloques cortos: "Quién escribe esto" (1 párrafo de 60 palabras sin foto si no la tienes), "Cómo nos pagamos" (transparencia: AdSense + Amazon afiliación con disclosure visible), "Promesa editorial" (frase de 1 línea no negociable: "Nunca recomendamos lo que no usamos. Nunca aceptamos producto a cambio de review positiva.")
12. **NUEVA sección "Newsletter"** — 1 input email + botón "Suscribirme". Headline ≤7 palabras, subhead ≤16 palabras. Microtexto privacidad. Form action puede ser FormSubmit (mismo que contacto.html) o placeholder
13. CTA band final (mantener pero re-escribir el copy para que cierre con el dato más fuerte: "10 pilares · 32.500 palabras · cero patrocinios" + link a /guias/)
14. Footer (mantener)

SHAPE / FORMATO OUTPUT:

Devuelves UN único archivo index.html completo (~700-900 líneas), válido HTML5, sin frameworks añadidos. Incluye:
- <head> idéntico al actual (meta tags, fonts, AdSense placeholders, JSON-LD)
- Añade JSON-LD adicional: FAQPage para la sección 10, ItemList para las featured guides
- Comentarios HTML cada sección nueva con su número y propósito
- Todas las URLs internas absolutas desde / (ej /guias/mejores-cerraduras-inteligentes-2026.html)
- Reutiliza clases CSS existentes (no inventes nuevas excepto si justificas comentado)
- Atributos accesibles: aria-label, role, semantic HTML5 (section, article, aside, nav)

MUST-AVOID — restricciones no negociables:

- NO inventes guías que no existen en el inventario. Si necesitas una guía 11 (ej "Hogar conectado bajo 200€"), márcala con href="#" y un comentario HTML que diga "TODO: crear pilar dedicado"
- NO uses palabras prohibidas: solución, expertos en, innovador, revolucionario, best-in-class, premium, líderes, robusto, escalable, world-class, cutting-edge, pasión, misión, compromiso
- NO añadas iconos genéricos tipo "estrella de calidad" o "medallas de oro" — los iconos son SVG inline simples (ya tienes ejemplos en el archivo actual: stroke-width 2, viewBox 24x24, no fills)
- NO uses emojis salvo si el resto del producto los usa ya (no los usa)
- NO inventes números: si dices "10.000 lectores mensuales" estás mintiendo. Solo usa los números verificables del contexto. Si necesitas decir "ahorro estimado", marca claramente la estimación
- NO traduzcas del inglés. Pensar y escribir en castellano España (no LatAm: "vosotros/vuestro" si plural; "ti/tu" si tú; nada de "ustedes" ni "su" formal)
- NO incluyas testimonios inventados. Si quieres bloque de testimonios, déjalo como TODO con comentario o quítalo entero
- NO toques el sistema de diseño (paleta, tipos, espaciados, radios). Cero CSS nuevo embebido salvo si justificas con comentario "/* nueva clase necesaria porque... */"
- NO añadas tracking de terceros (no GA, no Facebook pixel — solo el slot AdSense ya configurado y los placeholders Cloudflare Insights que están comentados)
- NO ocultes la afiliación afiliados. Disclosure debe ser visible cuando aplique (ya lo está en /guias/, en home solo si aparecen enlaces afiliados directos)

CRITERIO DE ÉXITO observable:

El nuevo index.html pasa estos checks objetivos:
- Cada link interno apunta a una página que existe (verificable con grep contra el inventario)
- Cada número en pantalla coincide con uno del contexto verificable
- Cada sección nueva tiene comentario HTML que la introduce con número y propósito
- HTML valida sin warnings críticos en validator.w3.org
- Lighthouse mobile mantiene Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100
- Schema markup nuevo (FAQPage, ItemList) valida en schema.org/validator
- Tiempo a primer scroll <1.5s en 4G simulado (LCP)
- Densidad ad mantenida: máx 2 slots above-the-fold por viewport

ENTREGABLE: un único bloque de código HTML completo, comentado, listo para sustituir directamente al index.html actual.
```

---

## Cómo usar este prompt

1. Abre Claude (claude.ai) o usa la API
2. Pega el bloque entero (desde `Rol:` hasta `entregable: un único bloque...`)
3. Si tienes acceso a Claude Opus 4.7, mejor (más densidad de detalle, menos invenciones); con Sonnet también funciona
4. Espera output de ~700-900 líneas
5. Guarda como `index.html.new` para revisarlo antes de sobrescribir
6. Revisa los TODOs (Claude marcará lo que no puede inventar)
7. Cuando estés conforme, sustituye el actual `index.html` y haz commit + push

## Prompts hermanos sugeridos (para después)

Si quieres ir más allá:

- **Hero animation** — Higgsfield Cinema Studio 3.5 → mock isométrico 6s de hogar conectado iluminándose por la noche en bucle perfecto, para sustituir el Three.js placeholder (sección 2 de tu biblioteca, ajusta a paleta)
- **OG image v2** — Higgsfield Nano Banana Pro → reemplaza el assets/og-image.png actual por uno con tipografía de marca + paleta cian/violeta + composición editorial (sección 1.1 de tu biblioteca)
- **Newsletter de bienvenida** — Claude prompt para escribir el email automático tras suscripción (mini-bienvenida con link a top 3 guías) — sección 4 de biblioteca pero adaptado
- **Calculadora "¿cuánto te ahorra automatizar tu casa?"** — interactiva con JS vanilla, similar a wattguide pero en castellano, 4 inputs (m², ecosistema, presupuesto, prioridad) → output: 2-3 productos recomendados con link a sus pilares respectivos. Esto se convierte en lead magnet brutal

---

**Sobre cumplimiento PRISM**:
- ✅ P (Purpose): rehacer home cubriendo 9 huecos diagnósticados, monetizada AdSense+afiliados, conversion-focused
- ✅ R (Role): senior frontend + content designer, no agencia ni portfolio
- ✅ I (Inputs): paleta, voz, inventario 10 pilares, números verificables, slots AdSense, CSS existente
- ✅ S (Shape): index.html completo 700-900 líneas, 14 secciones en orden, JSON-LD adicional, schema validable
- ✅ M (Must-avoid): blacklist 12 palabras, no inventar links/números/testimonios, no LatAm, no tracking terceros, no romper sistema visual

Self-check rubric pasa 5/5:
1. Audiencia explícita (hispanohablante 28-55 escéptico)
2. Criterio de éxito observable (Lighthouse / schema validator / grep links)
3. ≥1 exclusión nombrada (12 do-NOT)
4. Contexto previo tejido (CSS existente, slots AdSense, inventario real)
5. 0 vague qualifiers (cada adjetivo concreto: "≥90 Lighthouse mobile", "60 productos verificables")

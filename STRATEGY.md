# Hogarconectado.co — Estrategia (pivote 2026-05-12)

## Cambio estratégico

**Antes** (handoff 2026-04-28): aplicar a Google AdSense una vez ≥20 artículos y ≥30 días de tráfico.

**Ahora** (a partir de mayo 2026): **NO se aplica a AdSense**. El idioma (ES) + geo (España, mucho LATAM en SERPs) penaliza el RPM hasta 15× vs. inglés tier-1. El research confirmó RPM <$0.50 en LATAM y ~$3 CPM en España — no compensa los 7 meses de redacción a 2h/sem.

**Nuevo modelo principal: Amazon Asociados España**.
Comisión 3-8% sobre productos de electrónica/hogar (€100-300 ticket medio) → €3-24 por venta. Mucho más rentable que AdSense para este idioma+nicho.

## Lo que se mantiene

- Stack actual: static HTML + Cloudflare Pages.
- Pilar publicado: **mejores-alarmas-hogar-2026.html** (ya tiene formato review-comparativa, perfecto para afiliados).
- Hub `/guias/` con sus 9 cards (1 publicado + 8 "Próximamente").
- Páginas legales (privacidad, cookies) + Consent Mode v2 (se mantiene para tráfico Google y para cumplir RGPD aunque no llevemos AdSense).

## Lo que cambia ahora

1. **Disclosure de afiliación visible** arriba del hub de guías (✓ implementado 2026-05-12).
2. **El AdSense slot del hub** se ha sustituido por la pieza de disclosure. Cuando se publique un artículo nuevo, dejar 2 huecos de AdSense seguían intercalados — sirven como placeholder visual aunque no haya AdSense (puedes meter banners propios o promo de otras guías).
3. **Estrategia editorial**: cada review/guía debe contener una **tabla de comparativa con enlaces "Ver en Amazon"** (etiqueta de afiliado en la URL: `?tag=hogarconectad-21` o equivalente cuando se aprueben en Asociados).
4. **Producir solo guías comerciales**: "Mejores X", "Comparativa Y", "Z review". Cero blog informativo puro (sin product picks → 0 € por visita).
5. **Frecuencia**: 1 review nueva cada 4-6 semanas como mucho. No es prioridad alta.

## Próximas 2-3 reviews (orden recomendado)

1. **Cerraduras inteligentes 2026** (Nuki, Aqara, Yale, SwitchBot) — ticket alto (€180-350), comisión ~5%.
2. **Robots aspiradora 2026** (Roborock, Dreame, Ecovacs, Xiaomi) — ticket muy alto (€300-1.200), comisión ~3-5%.
3. **Termostatos inteligentes para España** (Tado°, Netatmo, Google Nest) — ticket €120-250, comisión ~5-7%.

## Lo que NO se hace

- Aplicar a Google AdSense.
- Buscar 20 artículos para el listón AdSense (la estrategia ya no necesita ese mínimo).
- Invertir en informativo puro / glosarios / explicativos sin product picks.

## Cómo darse de alta en Amazon Asociados España

1. https://afiliados.amazon.es → "Únete ahora gratis".
2. Verificar el dominio `hogarconectado.co` (DNS TXT).
3. Tras 1-2 días aprueban; recibirás un Associate Tag (ej. `hogarconectad-21`).
4. Reemplazar todos los enlaces a Amazon en las guías por `https://amzn.to/XXXXX` (Site Stripe) o por `https://www.amazon.es/dp/PRODUCT_ID?tag=hogarconectad-21`.
5. Los enlaces deben llevar `rel="sponsored nofollow"`.

## KPI realista

- Visitantes mes 6: 800-2.500 sesiones/mes (orgánico).
- CTR a Amazon: 8-15%.
- Conversión Amazon (24h cookie): 4-9%.
- Comisión media: €5-12 por venta.
- **Revenue esperable mes 6: €30-90/mes**. Mes 12 con 4-5 guías más: €100-300/mes.

Más bajo que wattguide post-AdSense, pero **complementario y sin coste adicional de tiempo** — las reviews que ya estaban planificadas valen para el modelo afiliado.

## Cuándo reconsiderar AdSense

Si el sitio supera **5.000 sesiones/mes** orgánicas en español de España (no LATAM), el CPM en España es suficiente para que añadir AdSense junto a los afiliados sume €40-100/mes extra. Antes de eso, AdSense estorba (penaliza UX, requiere los 20 artículos mínimos).

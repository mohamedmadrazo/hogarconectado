# Mom's Cloud — landing

Landing de una página para **Mom's Cloud** (Av. Portugal 35, Logroño): pancakes
japoneses soufflé, batidos y granizados para llevar.

HTML + CSS + JavaScript vanilla. **Sin build step, sin dependencias que instalar.**

---

## Estado del contenido

Precios **confirmados por el negocio**: 6,90 € (Arándanos, Cerezas), 5,90 €
(Choco-Coco, Limón, Jarabe de arce), 4,70 / 4,90 / 4,30 / 4,50 € en bebidas.
Están en `index.html` y también en el `hasMenu` del JSON-LD; si cambia un
precio hay que tocar los dos sitios.

Queda un único hueco: **el frapé no tiene precio** (el cartel del local no lo
muestra). Aparece como *«Pregúntanos»* y en el JSON-LD va como `MenuItem` sin
`offers`, que es válido. Un precio inventado sí sería un problema.

```bash
grep -n "data-todo" index.html     # lista todo lo que queda pendiente
```

## Desplegar en Vercel

El proyecto está listo: `vercel.json` ya lleva las cabeceras de seguridad, la
CSP, la caché y las redirecciones. **No hay build step**, así que no hay nada
que configurar más allá de la carpeta raíz.

Importar el repositorio desde vercel.com → *Add New… → Project*:

| Ajuste | Valor |
|---|---|
| Root Directory | **`moms-cloud`** ← lo único que no va por defecto |
| Framework Preset | Other |
| Build Command | *(vacío)* |
| Output Directory | *(vacío)* |
| Production Branch | `claude/moms-cloud-landing-page-nfl80x` |

La rama de producción importa: `main` es hogarconectado.co, un sitio distinto.

Después del primer despliegue hay que **poner `og:url` y `og:image` como URLs
absolutas** con el dominio que asigne Vercel. Los previsualizadores de WhatsApp,
Telegram y Facebook no resuelven rutas relativas, así que hasta entonces el
enlace se comparte sin tarjeta.

`_headers` y `_redirects` son formato Cloudflare Pages y Vercel los ignora. Se
conservan para no cerrar esa vía: los dos despliegues pueden convivir.

---

## Probar en local

No hay build. Se sirve como archivos estáticos, y hay que probarlo en **los dos
contextos**, porque validan cosas distintas:

```bash
# A) Tal y como vive hoy, dentro del repositorio de hogarconectado
cd ..           && python3 -m http.server 8080   # → http://localhost:8080/moms-cloud/

# B) Como vivirá en su propio dominio (raíz = esta carpeta)
python3 -m http.server 8081                      # → http://localhost:8081/
```

Ambos deben verse **idénticos**. Si B falla, se ha colado una ruta absoluta:
todas las rutas internas son relativas justamente para que mudarse de dominio
sea un cambio de configuración y no una refactorización.

---

## Estructura

```
index.html              Página completa. Todo el contenido está aquí, en el HTML.
favicon.svg             Nube de la marca, redibujada como vector.
_headers / _redirects   Cabeceras y redirecciones. INERTES hasta el dominio propio.
robots.txt              Igual: preparado para el futuro.
assets/
  css/base.css          Tokens --mc-*, fuentes, reset, primitivas.
  css/sections.css      Estilos por sección, en el orden del HTML.
  js/app.js             Nav y estado abierto/cerrado. No depende de GSAP.
  js/motion.js          Animación. Totalmente opcional (ver abajo).
  js/vendor/            GSAP, ScrollTrigger, SplitText y Lenis autohospedados.
  fonts/                Bricolage Grotesque y Montserrat, variables, subset latino.
  img/                  Fotos reales del local y de la carta.
```

---

## Dos decisiones que conviene no deshacer sin querer

### 1. La página nunca puede quedarse en blanco

El CSS **jamás** oculta contenido. Solo `motion.js` puede hacerlo, y solo tras
comprobar que GSAP cargó, que el usuario no pidió movimiento reducido y que el
elemento está bajo el pliegue. Todo va dentro de un `try/catch` y hay una red de
seguridad que revela la página entera a los 900 ms.

Consecuencia práctica: **no añadir nunca una regla `opacity: 0` a contenido real
fuera del bloque `html.mc-anim-ready` de `base.css`.**

Para comprobar que sigue siendo cierto:

- DevTools → Network → *Block request URL* sobre `gsap.min.js` → recargar.
  Debe verse toda la página.
- DevTools → Settings → Debugger → *Disable JavaScript* → recargar. Igual.

### 2. La valoración de Google no va en los datos estructurados

La página muestra «4,8 · 70 reseñas» enlazando a la ficha de Google, pero el
JSON-LD **no** incluye `aggregateRating`. Marcar en tu propia web reseñas que
están alojadas en un tercero va contra las directrices de Google y puede
acarrear una acción manual. Mostrarlo visible y enlazado da la misma
credibilidad sin el riesgo. **No añadir `aggregateRating` ni `review`.**

---

## El horario, en un solo sitio

El horario visible y el que calcula el estado *abierto/cerrado* son el mismo
dato. Cada fila de la lista lleva sus propios atributos:

```html
<li data-days="6" data-ranges="11:30-14:00,17:30-24:00">
```

`data-days` usa la numeración de JavaScript (**0 = domingo … 6 = sábado**).
`app.js` lee el DOM, así que **para cambiar el horario basta editar esa lista**:
el texto y el cálculo no pueden divergir.

El estado se resuelve siempre en `Europe/Madrid`, no en la hora del visitante.

---

## Checklist de lanzamiento (dominio propio)

1. Confirmar los precios (ver arriba) y resolver los `data-todo`.
2. Quitar `<meta name="robots" content="noindex, nofollow">` de `index.html`.
3. Añadir `<link rel="canonical">` con la URL definitiva.
4. Poner `og:url` y `og:image` como **URLs absolutas** — los previsualizadores de
   WhatsApp, Telegram y Facebook no resuelven rutas relativas.
5. Añadir `"url"` al JSON-LD y descomentar el `Sitemap:` de `robots.txt`.
6. Crear `sitemap.xml` con la única URL de la página.
7. Crear el proyecto en Cloudflare Pages con **Root directory = `moms-cloud/`**.
   Al hacerlo, `_headers` y `_redirects` se activan solos.
8. Validar el JSON-LD en la Prueba de resultados enriquecidos de Google.
9. Añadir la web a la ficha de Google Business Profile del negocio.

---

## Convivencia con hogarconectado.co

Esta carpeta vive, de momento, dentro del repositorio de `hogarconectado.co`,
que es un sitio **sin ninguna relación** y monetizado con AdSense.

Reglas que se han respetado y que conviene mantener:

- No se ha modificado **ningún** archivo fuera de `moms-cloud/`.
- `index.html` lleva `noindex` para no generar contenido ajeno bajo ese dominio.
- No se ha tocado el `robots.txt` de la raíz: durante un ciclo de revisión de
  AdSense es un archivo delicado, y el `noindex` de la propia página es un
  mecanismo más fuerte y más local.
- No se hace merge a `main`. El trabajo vive en su rama.

Comprobación de aislamiento:

```bash
git diff --stat main -- . ':(exclude)moms-cloud'   # debe salir vacío
```

**Recomendación:** en cuanto la landing esté validada, moverla a su propio
repositorio. Convivir con AdSense a largo plazo no aporta nada y sí añade riesgo.

---

## Imágenes

Todas las fotos son **reales**, del propio local y de la carta de Mom's Cloud.
Las de producto están recortadas del cartel de la carta y las de ambiente son
del rótulo del local. No hay ninguna imagen generada ni de banco.

Cuando haya fotografía profesional, sustituir los archivos de `assets/img/`
manteniendo los nombres y las proporciones (los productos son cuadrados, 560×560;
el `<img>` lleva `width`/`height` explícitos para que no haya saltos de layout).

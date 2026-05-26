# AdSense application step-by-step · hogarconectado.co

> Guía operativa para aplicar a Google AdSense y activar la monetización en este sitio. Hecha para ejecutar de un tirón cuando estés listo. Tiempo total: 45 minutos del usuario (más 1-4 semanas de espera por revisión de Google).

## Estado actual de prerrequisitos (2026-05-26)

| Requisito AdSense | Estado | Notas |
|---|---|---|
| Contenido editorial original ≥ 10 piezas | ✅ | 12 pilares publicados, ~39.900 palabras totales |
| Páginas legales completas | ✅ | `privacidad.html`, `cookies.html`, `about.html`, `contacto.html` |
| `ads.txt` en raíz HTTPS | ✅ | Con placeholder `pub-XXXXXXXXXXXXXXXX` listo para sustituir |
| Sitemap.xml accesible | ✅ | 14 URLs en `sitemap.xml`, enviado a GSC y Bing |
| Schema.org en pilares | ✅ | Article + BreadcrumbList + FAQPage en los 12 |
| Disclosure de afiliación | ✅ | Visible en cada pilar (Amazon hogarconect05-21 ya activo) |
| Mobile usability 100% | ✅ | Verificable en `search.google.com/test/mobile-friendly` |
| HTTPS forzado | ✅ | Cloudflare Pages + `_headers` con HSTS |
| Tráfico orgánico mínimo | ⏳ | No exigido por Google pero recomendable esperar 2-4 semanas tras publicación de los pilares |
| CMP TCF v2.2 (UE) | ⏳ | Custom consent activo, sustituir por Funding Choices tras aprobación |

**Veredicto técnico**: el sitio cumple los requisitos formales. Falta solo decidir el timing y dar al botón.

## Cuándo aplicar — la decisión

Google rechaza más por "contenido insuficiente / poco valor único" que por errores técnicos. El sitio ya tiene 12 pilares editoriales originales con metodología real (pruebas físicas, fuentes citadas, autores con bio) — pasa cualquier criterio razonable. Lo que añade margen es **demostrar tráfico orgánico real**.

Tres escenarios típicos:

| Escenario | Recomendación | Tiempo total a primera revenue |
|---|---|---|
| **Aplicar hoy** (sin tráfico orgánico aún) | Riesgo medio de rechazo por "tráfico bajo" — Google lo cita en ~30% de denegaciones | 1-3 semanas si aprueban a la primera; 4-8 si hay que reaplicar |
| **Esperar 2-3 semanas** (deja indexar 12 pilares en Google y Bing, espera primeras visitas orgánicas) | Riesgo bajo, suele aprobarse a la primera | 4-6 semanas total |
| **Esperar 30+ días con ≥200 visitas/día** | Casi siempre aprobado a la primera | 6-10 semanas total |

**Recomendación**: opción 2. Aplicar el 2026-06-15 (~3 semanas tras publicar el pilar 12). Para entonces los 12 pilares estarán indexados en GSC, habrá impresiones reales, y la solicitud entra con métricas a su favor. Mientras tanto, ningún trabajo añadido — solo escribir el pilar 13 si surge.

## Aplicación paso a paso (30 minutos)

### 1. Crear cuenta AdSense

1. Ir a `https://www.google.com/adsense/`
2. Click **Empezar** → iniciar sesión con `demadrazobruno@gmail.com` (la cuenta donde quieres recibir pagos)
3. Pegar el sitio: `https://hogarconectado.co`
4. País: **España** (afecta a la moneda EUR y al formulario fiscal posterior)
5. Idioma: **Español**
6. Aceptar términos
7. Click **Empezar a usar AdSense**

### 2. Conectar el sitio (verificación de propiedad)

AdSense te pide pegar un código `<script>` en el `<head>` de la home — pero **ya está hecho**: el script `adsbygoogle.js` ya está embebido en `index.html` y en los 12 pilares con `{{ADSENSE_CLIENT}}` como placeholder.

Lo que falta es **sustituir el placeholder por el publisher ID real**:

1. En AdSense, AdSense te muestra tu Publisher ID. Tiene formato `pub-1234567890123456` (16 dígitos tras `pub-`).
2. **Copia el ID completo** (todo, incluido `pub-`).
3. En PowerShell desde la raíz del repo, ejecuta el script de sustitución:

```powershell
Set-Location "c:\Users\demad\Documents\Claude\Projects\Generador de webs\hogarconectado"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$pubId = 'pub-XXXXXXXXXXXXXXXX'  # <-- pega tu publisher ID real aquí
$files = Get-ChildItem -Recurse -Include *.html,ads.txt
foreach ($f in $files) {
  $content = [System.IO.File]::ReadAllText($f.FullName, $utf8NoBom)
  if ($content -match 'pub-XXXXXXXXXXXXXXXX|\{\{ADSENSE_CLIENT\}\}') {
    $newContent = $content.Replace('{{ADSENSE_CLIENT}}', $pubId).Replace('pub-XXXXXXXXXXXXXXXX', $pubId)
    [System.IO.File]::WriteAllText($f.FullName, $newContent, $utf8NoBom)
    Write-Output "Updated: $($f.FullName)"
  }
}
```

**Importante**: usa `[System.IO.File]::ReadAllText/WriteAllText` con `UTF8NoBom`, NO `Get-Content`/`Set-Content -Encoding utf8` (rompe UTF-8 con tildes y eñes en PowerShell 5.1).

4. Commit + push:

```powershell
git add -A
git commit -m "feat: activate AdSense publisher ID across all pages and ads.txt"
git push
```

5. Cloudflare Pages despliega solo en 60-90 segundos.
6. Vuelve a AdSense → click **Verificar**. Google encuentra el `<meta name="google-adsense-account">` y/o el script, marca la verificación como hecha.

### 3. Información fiscal y de pago

1. AdSense te pide datos de pago. Selecciona **Particular** (la mayoría de creadores) o **Empresa** si tienes autónomo/SL.
2. Dirección postal real (Google envía PIN físico a esa dirección cuando alcances 10 € de umbral — meses después; recuerda dónde lo recibirás).
3. Información fiscal: para residentes en España, Google pide DNI/NIE. Formulario W-8BEN automático para tax treaty US-España (15% retención en lugar de 30%).
4. Cuenta bancaria para pagos: IBAN español, swift opcional.

Datos opcionales (puedes editarlos después): nombre del perfil de pagos, alias.

### 4. Solicitud de revisión

1. Click **Solicitar revisión del sitio**.
2. Google muestra: "Estamos revisando tu sitio. Esto suele tardar unos días, pero puede llevar hasta 2 semanas".
3. Cierra la pestaña. No hay nada más que hacer hasta la respuesta.

## Durante la revisión (2-14 días) — qué NO hacer

- ❌ NO publiques cambios mayores al diseño del sitio (provoca reanálisis automático y resetea contador)
- ❌ NO añadas redirects, popups o lo que Google interprete como "patrón engañoso"
- ❌ NO compres tráfico de baja calidad. Si compras Ads de Meta/Google para SEO, está OK; tráfico de bots descalifica
- ❌ NO instales otros networks ad (Ezoic, Mediavine) sin haber sido aprobado primero por AdSense
- ✅ SÍ sigue escribiendo contenido nuevo (no afecta a la revisión)
- ✅ SÍ comparte el sitio en redes (señales sociales suman)
- ✅ SÍ responde a comentarios si los hay (señal de engagement)

## Post-aprobación — checklist de activación

Google notifica por email: "Te damos la bienvenida a AdSense. Tu sitio está aprobado".

### 1. Generar slots por unidad (10 minutos)

1. AdSense → **Anuncios** → **Por unidad de anuncio** → **Crear unidad de anuncio**.
2. Crear **6 slots** (los 6 placeholders del repo). Para cada uno, anota el ID que da AdSense (formato `1234567890`):

| Slot interno | Tipo en AdSense | Tamaño |
|---|---|---|
| `AD_SLOT_HOME_LEADERBOARD` | Display | Responsive |
| `AD_SLOT_HOME_INFEED` | In-article | Fluid |
| `AD_SLOT_HUB_INFEED` | Display | Responsive |
| `AD_SLOT_SIDEBAR` | Display | 300×600 |
| `AD_SLOT_IN_ARTICLE_1` | In-article | Fluid |
| `AD_SLOT_IN_ARTICLE_2` | Display | Responsive |
| `AD_SLOT_MULTIPLEX` | Multiplex | Default |

### 2. Sustituir los placeholders en el código

```powershell
Set-Location "c:\Users\demad\Documents\Claude\Projects\Generador de webs\hogarconectado"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Diccionario: nombre placeholder → slot ID real de AdSense
$slots = @{
  'AD_SLOT_HOME_LEADERBOARD' = '1111111111'   # <-- sustituir
  'AD_SLOT_HOME_INFEED'      = '2222222222'
  'AD_SLOT_HUB_INFEED'       = '3333333333'
  'AD_SLOT_SIDEBAR'          = '4444444444'
  'AD_SLOT_IN_ARTICLE_1'     = '5555555555'
  'AD_SLOT_IN_ARTICLE_2'     = '6666666666'
  'AD_SLOT_MULTIPLEX'        = '7777777777'
}

$files = Get-ChildItem -Recurse -Include *.html
foreach ($f in $files) {
  $content = [System.IO.File]::ReadAllText($f.FullName, $utf8NoBom)
  $changed = $false
  foreach ($key in $slots.Keys) {
    $placeholder = "{{$key}}"
    if ($content.Contains($placeholder)) {
      $content = $content.Replace($placeholder, $slots[$key])
      $changed = $true
    }
  }
  if ($changed) {
    [System.IO.File]::WriteAllText($f.FullName, $content, $utf8NoBom)
    Write-Output "Updated: $($f.Name)"
  }
}
```

Commit + push:
```powershell
git add -A
git commit -m "feat: activate AdSense ad slot IDs across all pages"
git push
```

### 3. Activar Funding Choices (CMP TCF v2.2)

Obligatorio en UE. Sustituye al consent custom actual de `cookie-consent.js`.

1. AdSense → **Privacidad y mensajería** → **Mensajes de consentimiento de la UE / RU** → **Crear mensaje**.
2. Selecciona: "Mostrar un mensaje en mi sitio".
3. Idiomas: Español (principal), Inglés (fallback).
4. Botones: "Aceptar todo" + "Más opciones" + "Rechazar todo" (obligatorios desde 2024).
5. Logo: el favicon de hogarconectado.
6. Click **Publicar**.
7. AdSense te da un snippet `<script>` con tu Funding Choices ID. Sustituir el consent custom:

```powershell
# En index.html y guias/*.html, eliminar el bloque actual de cookie-consent.js y reemplazar por:
# <script async src="https://fundingchoicesmessages.google.com/i/pub-XXX?ers=1" nonce="..."></script>
```

(El detalle exacto del snippet aparece en el dashboard de Funding Choices.)

### 4. Activar Auto Ads — solo Anchor mobile

1. AdSense → **Anuncios** → **Por sitio** → `hogarconectado.co` → **Editar**.
2. Activar **Anuncios automáticos** → **Solo Anchor** (desactivar Vignette, In-page, Multiplex automáticos — usamos manuales).
3. Frecuencia: por defecto.
4. Guardar.

### 5. Verificar `ads.txt`

Una vez que el publisher ID está en el `ads.txt` (paso 2 de la aplicación), AdSense lo verifica automáticamente en 24-48 horas. Aparece como verde en AdSense → **Cuenta** → **Configuración de la cuenta** → **`ads.txt`**.

## Errores comunes y cómo evitarlos

| Error | Causa | Solución |
|---|---|---|
| Rechazo por "contenido insuficiente" | Pocos pilares o thin content | Esperar a tener 12+ pilares de >2000 palabras (ya está hecho) |
| Rechazo por "navegación difícil" | Páginas legales mal enlazadas | Footer debe enlazar `privacidad`, `cookies`, `aviso legal`, `contacto` (ya está hecho) |
| Rechazo por "comportamiento engañoso" | Botones falsos, popups molestos, "haz click aquí" en ads | Verificar que ningún CTA pseudo-imita un ad |
| Rechazo por "duplicación" | Contenido spineado o traducido masivo | El sitio tiene contenido original — no aplica |
| Aprobación con "no muestra anuncios" | `ads.txt` no verificado o slots sin tráfico | Esperar 24-48h post-activación, revisar errores en Policy Center |
| Anuncios en blanco | CMP no devuelve consent, slots mal configurados, AdBlock | Probar en incognito con AdBlock desactivado |

## KPIs a vigilar el primer mes

| KPI | Dónde verlo | Objetivo mes 1 |
|---|---|---|
| **RPM** (ingresos por 1k pageviews) | AdSense → Informes | €2-5 (España es tier-1 bajo) |
| **CTR** | AdSense → Informes | 0,8-1,5 % aceptable |
| **Viewabilidad** | AdSense → Optimización | > 60 % |
| **CLS** post-ads | PageSpeed Insights / GSC Core Web Vitals | ≤ 0,1 |
| **Policy violations** | AdSense → Centro de políticas | 0 |
| **ads.txt status** | AdSense → Cuenta → ads.txt | Verde (autorizado) |

Si RPM cae por debajo de €1 sostenido, revisar:
1. ¿Hay alguna violación de policy?
2. ¿El CMP devuelve consent o lo rechaza todo el mundo?
3. ¿Hay tráfico de países de baja CPC (LATAM) en vez de España? — el modelo dual con Amazon afiliados compensa esto.

## Comandos de referencia rápida

Cuando te llegue la aprobación, los comandos exactos por orden de ejecución están en este mismo doc:

1. Sustituir publisher ID → sección "Aplicación paso a paso → 2"
2. Sustituir slot IDs → sección "Post-aprobación → 2"
3. Verificar ads.txt → automático, espera 24h
4. Activar Funding Choices → sección "Post-aprobación → 3"
5. Activar Auto Ads Anchor → sección "Post-aprobación → 4"

Todo el flujo desde aprobación a primer dinero generado: ~2 horas de trabajo + 24-48h de espera.

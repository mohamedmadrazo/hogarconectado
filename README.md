# hogarconectado.co

Sitio estático en español sobre domótica y hogar conectado. Monetización vía Google AdSense.

## Stack

- HTML5 + CSS3 + JavaScript vanilla
- GSAP + Three.js (hero 3D)
- Cloudflare Pages (hosting + CDN)
- Cloudflare Web Analytics (privacy-friendly, sin cookies)
- FormSubmit.co (formulario contacto/newsletter)

## Estructura

```
hogarconectado/
├── index.html                       # Home + hero 3D
├── about.html                       # Quiénes somos
├── contacto.html                    # Formulario de contacto
├── privacidad.html                  # Privacy policy (RGPD/LOPDGDD)
├── cookies.html                     # Política de cookies
├── 404.html                         # Página not-found branded
├── guias/
│   ├── index.html                   # Hub de guías
│   ├── mejores-alarmas-hogar-2026.html   # Artículo pilar
│   ├── _template.html               # Plantilla para nuevos artículos
│   └── _appliance-template.html     # Plantilla para comparativas
├── assets/
│   ├── style.css
│   ├── main.js
│   ├── cookie-consent.js            # Banner GDPR + Consent Mode v2
│   ├── cookie-consent.css
│   └── og-image.png                 # 1200x630 para OG/Twitter
├── _headers                         # CSP + HSTS + cache rules
├── _redirects                       # www→apex, legacy paths
├── ads.txt                          # Google AdSense (rellenar pub-ID tras aprobación)
├── robots.txt
├── sitemap.xml
├── site.webmanifest                 # PWA
├── favicon.svg
└── README.md
```

## Desarrollo local

No hay build step. Abre `index.html` directamente o sirve con Python:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

Para testear rutas absolutas (`/guias/`, `/assets/`) debes servir desde la **raíz del proyecto**, no abrir el archivo con `file://`.

## Despliegue (Cloudflare Pages)

1. **Push este repo a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial release"
   git branch -M main
   git remote add origin git@github.com:TU_USUARIO/hogarconectado.git
   git push -u origin main
   ```

2. **Crear proyecto en Cloudflare Pages**
   - `dash.cloudflare.com` → Workers & Pages → Create → Pages → Connect to Git
   - Repo: `hogarconectado`
   - Framework preset: **None**
   - Build command: *(vacío)*
   - Build output directory: `/`

3. **Conectar el dominio** `hogarconectado.co` + `www.hogarconectado.co` en **Custom domains**.

4. **SSL/TLS:** Full (strict) + Always Use HTTPS ON.

Ver la guía completa en `../LAUNCH.md`.

## Post-despliegue

- [ ] Activar Cloudflare Web Analytics (descomentar en HTML con el token real)
- [ ] Verificar en Google Search Console con DNS TXT
- [ ] Submit `/sitemap.xml`
- [ ] Aplicar a AdSense cuando haya ≥20 artículos y ≥30 días de tráfico
- [ ] Sustituir `pub-XXXXXXXXXXXXXXXX` en `ads.txt` tras la aprobación
- [ ] Ejecutar `../inject_adsense.py TU_PUB_ID` para activar los anuncios

## Añadir un artículo nuevo

1. Copia `guias/_template.html` a `guias/tu-slug-seo.html`
2. Rellena `<!-- TITLE -->`, `<!-- DESC -->`, `<!-- BODY -->`, `<!-- FAQ -->`
3. Actualiza `BreadcrumbList` + `Article` JSON-LD
4. Añade al `sitemap.xml` con `<lastmod>` actual
5. Añade una `<article class="guide-card">` en `guias/index.html`
6. `git push` → Cloudflare desplega solo

## Comandos útiles

```bash
# Verificar links internos rotos
python3 -c "
import re, pathlib
root = pathlib.Path('.')
files = {str(p.relative_to(root)) for p in root.rglob('*')}
broken = []
for html in root.rglob('*.html'):
    for m in re.findall(r'(?:href|src)=\"/([^\"#?]+)\"', html.read_text(encoding='utf-8')):
        if m and m not in files:
            broken.append((html.name, m))
print('OK' if not broken else broken)
"

# Validar headers CSP en producción
curl -sI https://hogarconectado.co/ | grep -i content-security-policy
```

## Licencia

Contenido propietario. Código © 2026 Bruno de Madrazo.

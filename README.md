# hogarconectado.co

Guías independientes de domótica y hogar inteligente en español: comparativas
probadas, calculadoras de ahorro y un índice de amortización por comunidad autónoma
con dataset abierto.

## Stack

- HTML5 + CSS3 + JavaScript vanilla, sitio estático (sin build)
- Cloudflare Pages (hosting + CDN)

## Desarrollo local

Servir desde la raíz del proyecto (las rutas absolutas requieren servidor, no `file://`):

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Datos

El dataset del índice de amortización por CCAA (`assets/data/`) se publica bajo
licencia CC BY 4.0. Fuentes y supuestos en la
[página de metodología](https://hogarconectado.co/metodologia).

## Licencia

Contenido © 2026 Bruno de Madrazo. Datasets CSV: CC BY 4.0.

# Setup Newsletter · hogarconectado.co

Sistema de captura email + welcome email automático. Stack escogido: **Brevo** (antes Sendinblue) por ser:
- Gratis hasta 300 emails/día
- GDPR-friendly (HQ París, servidores UE)
- API + automation incluidos en plan gratuito
- Dashboard en español
- Compatibilidad con FormSubmit como fallback de emergencia

## Estado actual del código

**Sin setup**: el formulario en `index.html` (sección Newsletter) está actualmente apuntando a FormSubmit.co como el resto de formularios del sitio. **Funciona** para capturar emails, pero no envía welcome email automático — solo te llega un correo a tu bandeja diciendo "nuevo suscriptor".

**Con Brevo configurado**: las nuevas suscripciones se añaden automáticamente a una lista de Brevo, que dispara el welcome email diseñado en `BIENVENIDA-email.html`. Tú no haces nada más que diseñar nuevos newsletters mensuales cuando quieras.

## Pasos para activar Brevo (15 minutos, una vez)

### 1. Crear cuenta Brevo (gratis)

1. Ve a `https://www.brevo.com/es/`
2. Click **Suscribirme gratis** → email + contraseña
3. Confirma cuenta vía email
4. Salta los onboarding pop-ups (vas a configurar tú)

### 2. Crear la lista de suscriptores

1. Sidebar izquierdo → **Contactos** → **Listas**
2. Click **+ Nueva lista**
3. Nombre: `Newsletter Hogar Conectado`
4. Carpeta: dejar por defecto
5. Click **Crear**
6. **Anota el ID de la lista** que aparece en la URL después de crearla (ej. `https://app.brevo.com/contact/list-listing/123` → ID = `123`)

### 3. Importar el welcome email a Brevo

1. Sidebar izquierdo → **Campañas** → **Plantillas** (o **Templates**)
2. Click **+ Nueva plantilla**
3. Selecciona modo **Importar código HTML**
4. Pega el contenido completo de `BIENVENIDA-email.html` (de este repo)
5. Nombre interno: `Welcome · Hogar Conectado`
6. Asunto del email: `Bienvenido a Hogar Conectado · sin spam, prometido`
7. Texto de previsualización: `Tu primer email con las 3 guías más leídas y la promesa editorial.`
8. Remitente: `equipo@hogarconectado.co` (configurar dominio en paso 5)
9. Guardar

### 4. Crear la automation de welcome

1. Sidebar izquierdo → **Automatización** → **Workflows** → **+ Crear nuevo workflow**
2. Tipo: **Workflow personalizado** (custom)
3. Nombre: `Welcome subscriber`
4. **Punto de entrada (trigger)**:
   - Tipo: **Contacto añadido a una lista**
   - Lista: la `Newsletter Hogar Conectado` que creaste
5. **Acción 1**: Esperar `30 segundos` (para dar tiempo a que el form complete)
6. **Acción 2**: **Enviar email**
   - Plantilla: `Welcome · Hogar Conectado` (la del paso 3)
7. Activar workflow (botón superior derecho)

### 5. Verificar dominio remitente (importante para deliverability)

1. Sidebar izquierdo → **Configuración** (engranaje) → **Senders, domains & dedicated IPs**
2. Click **Add a domain** → `hogarconectado.co`
3. Brevo te da registros DNS (DKIM, SPF, DMARC) — añádelos en Cloudflare:
   - `dash.cloudflare.com` → dominio hogarconectado.co → DNS → Records
   - Añade los 3-4 registros TXT que Brevo indica
   - Espera 5-10 min, vuelve a Brevo y click **Verify**
4. Una vez verificado, configura `equipo@hogarconectado.co` como remitente por defecto

### 6. Conectar el formulario del sitio a Brevo

Hay dos formas. Recomendado: **Cloudflare Worker como proxy** (la API key de Brevo no se expone en el navegador).

#### Opción A — Brevo hosted form (rápida, menos elegante)

1. Brevo → **Contactos** → **Formularios** → **+ Crear formulario**
2. Selecciona la lista `Newsletter Hogar Conectado`
3. Diseña un formulario básico (solo campo email)
4. Brevo te da código HTML del formulario embebible
5. Reemplaza el formulario actual en `index.html` (sección `#newsletter`) por el código de Brevo
6. Suelo no encaja al 100% con el estilo del sitio — requerirá CSS adicional para encajar

#### Opción B — Cloudflare Worker proxy (recomendado, mantiene tu diseño)

**El código y los pasos detallados están en [`worker/README.md`](worker/README.md).** Es un Worker de ~130 líneas, sin dependencias, con honeypot anti-spam, rate-limit opcional, redirects de error semánticos y manejo correcto de "ya suscrito".

Resumen del flujo (ver worker/README.md para los pasos completos):

1. **Crear Worker en dashboard** (`dash.cloudflare.com` → Workers & Pages → Create → Workers → Hello World) llamado `hogarconectado-newsletter`.
2. **Pegar el código** de [`worker/subscribe.js`](worker/subscribe.js) en el editor.
3. **Configurar tres secrets** en Settings → Variables and Secrets:
   - `BREVO_API_KEY` (de Brevo → SMTP & API → API Keys)
   - `BREVO_LIST_ID` (ID numérico de la lista que creaste en paso 2)
   - `ALLOWED_ORIGIN` = `https://hogarconectado.co`
4. **Apuntar el form** en `index.html` al URL del Worker (`https://hogarconectado-newsletter.<tu-cuenta>.workers.dev`).
5. **Añadir campo honeypot** `<input name="website">` invisible al form (snippet en worker/README.md paso 5).
6. **Opcional**: route custom en `hogarconectado.co/api/subscribe` para no exponer `workers.dev`.

Para probar antes de pegar la URL al form, hay un comando curl directo en worker/README.md paso 4.

## Mantenimiento mensual

Una vez al mes, escribir un nuevo newsletter con:

- **Asunto**: declarativo, sin "no te lo pierdas". Ej: "3 reviews nuevas + una marca que dejamos de recomendar".
- **Estructura**: 1 párrafo intro (qué hay este mes) + 3 bloques (uno por novedad) + footer con baja.
- **Diseño**: usar `BIENVENIDA-email.html` como plantilla base, sustituir contenido.

Enviar el newsletter:
1. Brevo → Campañas → Email → Crear campaña
2. Importar template basado en welcome modificado
3. Destinatarios: lista `Newsletter Hogar Conectado`
4. Programar envío (no en lunes mañana — peor open rate). Recomendado: martes o miércoles, 10:00-11:00.

## Estado actual del proyecto

Lo que ya está hecho:
- ✅ Formulario newsletter funcionando en `index.html` (vía FormSubmit como fallback)
- ✅ Plantilla welcome email diseñada en `BIENVENIDA-email.html`
- ✅ Atributo `data-brevo-list-id="{{BREVO_LIST_ID}}"` en el form (placeholder para activar)
- ⏳ Pendiente: hacer los 6 pasos de setup arriba para activar Brevo automático

Lo que está pendiente y no es bloqueante:
- Verificar dominio `hogarconectado.co` con DKIM/SPF/DMARC en Brevo (paso 5)
- Crear el Worker proxy si quieres mantener el diseño del form (paso 6, Opción B)

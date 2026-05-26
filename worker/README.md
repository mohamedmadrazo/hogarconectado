# Brevo Newsletter Worker · hogarconectado.co

Production-ready Cloudflare Worker that proxies the newsletter form to Brevo without exposing the API key in the browser. Validates email, drops bot submissions via honeypot, rate-limits (optional), and triggers the Brevo welcome-email automation.

## Files

- `subscribe.js` — the Worker code (≈130 lines, no dependencies)
- `wrangler.toml` — only needed if you deploy via CLI; dashboard deploy ignores it

## Deploy in 6 minutes (dashboard, no CLI)

### 1. Create the Worker

1. Go to `dash.cloudflare.com` → **Workers & Pages** → **Create** → **Workers** → start with **Hello World**
2. Name it: `hogarconectado-newsletter`
3. Click **Deploy** (just to register it), then **Edit code**

### 2. Paste the code

1. Delete everything in `worker.js` (or `index.js`)
2. Paste the full contents of `subscribe.js` from this folder
3. Click **Save and deploy**

### 3. Set the secrets (the API key and list ID)

In the Worker page → **Settings** → **Variables and Secrets**:

| Variable name   | Type   | Value                                        |
| --------------- | ------ | -------------------------------------------- |
| `BREVO_API_KEY` | Secret | paste your Brevo API v3 key                  |
| `BREVO_LIST_ID` | Secret | numeric list ID (e.g. `2`)                   |
| `ALLOWED_ORIGIN`| Text   | `https://hogarconectado.co`                  |

**Where to get the key**: Brevo → **Settings** (engranaje top-right) → **SMTP & API** → **API Keys** → **Generate a new API key**. Name it `wrangler` or `cloudflare-worker`. Permissions: *Contacts*. Copy the key once — Brevo won't show it again.

**Where to get the list ID**: Brevo → **Contacts** → **Lists** → click the list → the URL ends in `/list/<id>` where `<id>` is the number you need.

### 4. Get the Worker URL

After saving, the Worker is live at:
```
https://hogarconectado-newsletter.<your-cf-account>.workers.dev
```

Test it directly with curl:
```powershell
curl.exe -X POST "https://hogarconectado-newsletter.<your-account>.workers.dev" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "email=test@example.com&source=test"
```

Expected: HTTP 302 redirect to `https://hogarconectado.co/?subscribed=1#newsletter`. The contact should appear in Brevo within seconds.

### 5. Point the form to the Worker

In [`index.html`](../index.html) find the form `class="newsletter-form"` and change its `action` attribute from FormSubmit to your Worker URL:

```html
<form class="newsletter-form" method="POST"
      action="https://hogarconectado-newsletter.<your-account>.workers.dev">
  <input type="email" name="email" required placeholder="tu@email.com">
  <!-- Honeypot: invisible to humans, bots fill it -->
  <input type="text" name="website" tabindex="-1" autocomplete="off"
         style="position:absolute;left:-9999px;opacity:0;height:0">
  <input type="hidden" name="source" value="home-newsletter">
  <button type="submit" class="btn btn-primary">Suscribirme gratis</button>
</form>
```

The honeypot field `website` is the anti-spam mechanism — bots fill every input, humans never see it, and the Worker silently swallows any submission with a non-empty `website`.

### 6. Optional: route at hogarconectado.co/api/subscribe

If you want the form to POST to your own domain instead of `*.workers.dev` (cleaner, also bypasses ad blockers that block workers.dev):

1. Worker page → **Settings** → **Triggers** → **Add route**
2. Route: `hogarconectado.co/api/subscribe`
3. Zone: `hogarconectado.co`
4. Save
5. Update the form `action` to `https://hogarconectado.co/api/subscribe`

## Optional: 5-minute rate limit per email

To prevent abuse (one signup per email per 5 minutes):

1. Workers & Pages → **KV** → **Create namespace** → name it `newsletter-ratelimit`
2. Worker page → **Settings** → **Variables and Secrets** → scroll to **KV Namespace Bindings** → **Add**
3. Variable name: `RATE_LIMIT_KV`, namespace: `newsletter-ratelimit`
4. Save and redeploy. The Worker auto-detects the binding and starts enforcing the limit.

## Error redirect codes

If a submission fails, the Worker redirects to `?subscribed=0&reason=<code>`. Codes:

| code        | meaning                                         |
| ----------- | ----------------------------------------------- |
| `method`    | request was not POST                            |
| `body`      | body could not be parsed                        |
| `email`     | email missing or invalid format                 |
| `rate`      | rate-limited (KV binding active)                |
| `config`    | secrets not set in the Worker                   |
| `network`   | could not reach Brevo API                       |
| `brevo4xx`  | Brevo rejected the request (4xx)                |
| `brevo5xx`  | Brevo had an internal error (5xx)               |

You can show a contextual error message client-side by reading `URLSearchParams` on the page after redirect. Optional snippet for `index.html`:

```html
<script>
(function() {
  const p = new URLSearchParams(location.search);
  if (p.get('subscribed') === '1') {
    document.querySelector('.newsletter-message').textContent = '✓ Suscripción confirmada. Revisa tu bandeja en unos minutos.';
  } else if (p.get('subscribed') === '0') {
    const reason = p.get('reason');
    const msg = reason === 'email' ? 'Email no válido.' :
                reason === 'rate'  ? 'Ya intentaste suscribirte hace poco. Espera 5 minutos.' :
                                     'Algo falló. Inténtalo de nuevo en un minuto.';
    document.querySelector('.newsletter-message').textContent = msg;
  }
})();
</script>
```

## CLI deploy (alternative to dashboard)

If you have Node + npm and prefer the CLI:

```powershell
cd worker
npm install -g wrangler
wrangler login
wrangler secret put BREVO_API_KEY     # paste when prompted
wrangler secret put BREVO_LIST_ID     # paste when prompted
wrangler deploy
```

The `wrangler.toml` in this folder is preconfigured for this flow.

## Maintenance

- The Worker has zero dependencies and zero npm packages. It will keep working without updates for years.
- Brevo's free tier allows 300 emails/day — plenty for a small newsletter.
- If Brevo changes their API path (rare), update the `https://api.brevo.com/v3/contacts` URL in `subscribe.js`.
- API keys can be rotated in Brevo dashboard → re-run `wrangler secret put BREVO_API_KEY` (or update the secret in CF dashboard).

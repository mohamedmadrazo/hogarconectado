// ============================================================================
// Brevo subscribe proxy · hogarconectado.co
// ----------------------------------------------------------------------------
// Receives POST from the newsletter form, validates email, adds the contact to
// the configured Brevo list. The welcome email is triggered by Brevo's own
// "contact added to list" automation (see NEWSLETTER-SETUP.md step 4).
//
// Env vars (set as Secrets in the Cloudflare dashboard, NOT inline):
//   BREVO_API_KEY  - Brevo API key (Settings → SMTP & API → API Keys)
//   BREVO_LIST_ID  - numeric list ID (Contacts → Lists → URL ends in /<id>)
//   ALLOWED_ORIGIN - https://hogarconectado.co (production) — used for CORS
//
// Optional KV binding (rate limiting):
//   RATE_LIMIT_KV  - Workers KV namespace (limits one signup per email per 5min)
// ============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SUCCESS_REDIRECT = 'https://hogarconectado.co/?subscribed=1#newsletter';
const ERROR_REDIRECT   = 'https://hogarconectado.co/?subscribed=0&reason=';

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || 'https://hogarconectado.co';

    // CORS preflight (for JS fetch from same-origin or fetch with credentials)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin':  origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age':       '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return redirect(`${ERROR_REDIRECT}method`, origin);
    }

    // Parse body (supports both form-encoded and JSON)
    let email, source, honeypot;
    const ct = request.headers.get('content-type') || '';
    try {
      if (ct.includes('application/json')) {
        const json = await request.json();
        email    = (json.email || '').trim().toLowerCase();
        source   = json.source || 'home';
        honeypot = json.website || '';
      } else {
        const fd = await request.formData();
        email    = (fd.get('email') || '').toString().trim().toLowerCase();
        source   = (fd.get('source') || 'home').toString();
        honeypot = (fd.get('website') || '').toString();
      }
    } catch {
      return redirect(`${ERROR_REDIRECT}body`, origin);
    }

    // Honeypot: hidden field "website" — bots fill everything, humans leave it empty
    if (honeypot) {
      // Silently pretend success so bots don't retry
      return redirect(SUCCESS_REDIRECT, origin);
    }

    if (!email || !EMAIL_RE.test(email) || email.length > 200) {
      return redirect(`${ERROR_REDIRECT}email`, origin);
    }

    // Optional rate limit (5 min per email)
    if (env.RATE_LIMIT_KV) {
      const recent = await env.RATE_LIMIT_KV.get(`em:${email}`);
      if (recent) return redirect(`${ERROR_REDIRECT}rate`, origin);
      await env.RATE_LIMIT_KV.put(`em:${email}`, '1', { expirationTtl: 300 });
    }

    if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) {
      return redirect(`${ERROR_REDIRECT}config`, origin);
    }

    const listId = Number(env.BREVO_LIST_ID);
    const payload = {
      email,
      listIds: [listId],
      attributes: {
        SOURCE:      source.slice(0, 40),
        SIGNUP_DATE: new Date().toISOString(),
      },
      updateEnabled: true,
    };

    let brevoResp;
    try {
      brevoResp = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key':      env.BREVO_API_KEY,
          'content-type': 'application/json',
          'accept':       'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      return redirect(`${ERROR_REDIRECT}network`, origin);
    }

    // 201 = created, 204 = updated (already existed), 400 = bad request, 401 = bad key
    if (brevoResp.status >= 200 && brevoResp.status < 300) {
      return redirect(SUCCESS_REDIRECT, origin);
    }

    // 400 with "Contact already exist" is fine (updateEnabled handles it,
    // but Brevo sometimes still returns 400 if the contact is in an
    // unsubscribe state). Treat as success to avoid leaking info.
    const errBody = await brevoResp.text();
    if (brevoResp.status === 400 && /already/i.test(errBody)) {
      return redirect(SUCCESS_REDIRECT, origin);
    }

    return redirect(`${ERROR_REDIRECT}brevo${brevoResp.status}`, origin);
  },
};

function redirect(url, origin) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      'Access-Control-Allow-Origin': origin,
      'Cache-Control': 'no-store',
    },
  });
}

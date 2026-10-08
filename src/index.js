const MAX_BODY_LENGTH = 12_000;
const MAX_FIELD_LENGTH = 2_000;
const RECIPIENT = "demi@scaddenfamily.com";
const SENDER = "contact@dogearedplush.com";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function clean(value, limit = MAX_FIELD_LENGTH) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) {
      return json({ ok: false, error: "Invalid request origin." }, 403);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > MAX_BODY_LENGTH) {
      return json({ ok: false, error: "Message is too large." }, 413);
    }

    let submitted;
    try {
      const rawBody = await request.text();
      if (rawBody.length > MAX_BODY_LENGTH) {
        return json({ ok: false, error: "Message is too large." }, 413);
      }
      submitted = JSON.parse(rawBody);
    } catch {
      return json({ ok: false, error: "Please check the form and try again." }, 400);
    }

    if (!submitted || typeof submitted !== "object" || Array.isArray(submitted)) {
      return json({ ok: false, error: "Please check the form and try again." }, 400);
    }

    // Quietly accept honeypot submissions so bots do not learn they were caught.
    if (clean(submitted.website)) {
      return json({ ok: true });
    }

    const name = clean(submitted.name, 120);
    const email = clean(submitted.email, 254);
    const toy = clean(submitted.toy, 160).replace(/[\r\n]+/g, " ");
    const details = clean(submitted.message, 4_000);

    if (!name || !toy || !details || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "Please complete all fields with a valid email address." }, 400);
    }

    if (!env.EMAIL) {
      return json({ ok: false, error: "The contact form is temporarily unavailable. Please email Demi directly." }, 503);
    }

    try {
      await env.EMAIL.send({
        to: RECIPIENT,
        from: { email: SENDER, name: "Dog-Eared Plush Repair Co." },
        replyTo: email,
        subject: toy,
        text: `Name: ${name}\nEmail: ${email}\nToy: ${toy}\n\nDetails:\n${details}`,
      });
      return json({ ok: true });
    } catch (error) {
      console.error("Contact form email failed", error?.code || "unknown");
      return json({ ok: false, error: "We couldn't send your message right now. Please try again or email Demi directly." }, 502);
    }
  },
};

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { reportWarning } from "@/lib/monitoring";

const TOLERANCE_SECONDS = 5 * 60;
const ALERT_EVENTS = new Set([
  "email.bounced",
  "email.failed",
  "email.complained",
]);

type ResendWebhookEvent = {
  type?: string;
  data?: {
    email_id?: string;
    bounce?: { type?: string; subType?: string };
    // Also present but NEVER logged: to, from, subject, bounce.message
    // (bounce messages can embed the recipient address).
  };
};

/**
 * Svix signature verification (Resend signs webhooks via Svix): HMAC-SHA256
 * over `${svix-id}.${svix-timestamp}.${rawBody}` with the base64-decoded
 * secret after the whsec_ prefix. The signature header holds space-delimited
 * "v1,<base64>" entries — several during secret rotation — accept any match.
 */
function signatureMatches(
  rawBody: string,
  headers: Headers,
  secret: string,
): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;

  const skewSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(skewSeconds) || skewSeconds > TOLERANCE_SECONDS) {
    return false;
  }

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = Buffer.from(
    createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest("base64"),
  );

  return signatures.split(" ").some((entry) => {
    const [version, signature] = entry.split(",");
    if (version !== "v1" || !signature) return false;
    const received = Buffer.from(signature);
    return (
      received.length === expected.length && timingSafeEqual(received, expected)
    );
  });
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    reportWarning(
      "RESEND_WEBHOOK_SECRET is not configured — delivery-failure alerts are disabled.",
      {
        category: "email.resend",
        fingerprint: ["resend-webhook-secret-missing"],
      },
    );
    return NextResponse.json(
      { message: "Webhook secret is not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();

  if (!signatureMatches(rawBody, request.headers, secret)) {
    reportWarning("Resend webhook rejected: invalid signature", {
      category: "webhook.signature",
      tags: { reason: "mismatch" },
      extra: { bodyLength: rawBody.length },
      fingerprint: ["resend-webhook-invalid-signature"],
    });
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(rawBody) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  if (event.type && ALERT_EVENTS.has(event.type)) {
    reportWarning(`Resend delivery failure: ${event.type}`, {
      category: "email.resend",
      tags: {
        resendEventType: event.type,
        ...(event.data?.bounce?.type
          ? { bounceType: event.data.bounce.type }
          : {}),
        ...(event.data?.bounce?.subType
          ? { bounceSubType: event.data.bounce.subType }
          : {}),
      },
      // email_id only — look the recipient up in the Resend dashboard.
      extra: { emailId: event.data?.email_id },
      fingerprint: ["resend-delivery-failure", event.type],
    });
  }

  // 200 for every verified event so Svix doesn't retry unhandled types.
  return NextResponse.json({ received: true });
}

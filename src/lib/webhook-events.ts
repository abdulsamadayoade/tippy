import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { webhookEvent } from "@/lib/db/schema";
import { reportError } from "@/lib/monitoring";

type WebhookOutcome =
  | "settled"
  | "reconciled"
  | "ignored"
  | "error"
  | "invalid";

type ParsedWebhookEvent = {
  eventType?: string;
  eventData?: {
    paymentReference?: string;
    reference?: string;
  };
};

async function recordWebhookEvent({
  rawBody,
  parsed,
  signatureValid,
}: {
  rawBody: string;
  parsed: ParsedWebhookEvent | null;
  signatureValid: boolean;
}): Promise<string | null> {
  try {
    const bodyHash = createHash("sha256").update(rawBody).digest("hex");
    const reference =
      parsed?.eventData?.paymentReference ??
      parsed?.eventData?.reference ??
      null;

    const [row] = await db
      .insert(webhookEvent)
      .values({
        eventType: parsed?.eventType ?? null,
        signatureValid,
        reference,
        payload: (parsed ?? { unparseable: true }) as Record<string, unknown>,
        bodyHash,
      })
      .onConflictDoUpdate({
        target: webhookEvent.bodyHash,
        set: {
          receivedCount: sql`${webhookEvent.receivedCount} + 1`,
        },
      })
      .returning({ id: webhookEvent.id });

    return row?.id ?? null;
  } catch (error) {
    reportError(error, {
      category: "webhook.persistence",
      tags: { step: "record" },
      fingerprint: ["webhook-event-record-failed"],
    });
    return null;
  }
}

async function finishWebhookEvent(
  id: string | null,
  outcome: WebhookOutcome,
  errorMessage?: string,
): Promise<void> {
  if (!id) return;

  try {
    await db
      .update(webhookEvent)
      .set({
        processingOutcome: outcome,
        processingError: errorMessage?.slice(0, 500) ?? null,
        processedAt: new Date(),
      })
      .where(eq(webhookEvent.id, id));
  } catch (error) {
    reportError(error, {
      category: "webhook.persistence",
      tags: { step: "finish" },
      fingerprint: ["webhook-event-finish-failed"],
    });
  }
}

export { type WebhookOutcome, recordWebhookEvent, finishWebhookEvent };

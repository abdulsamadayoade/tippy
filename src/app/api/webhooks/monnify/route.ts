import { recordPayoutOutcome } from "@/lib/payouts";
import { parseProviderFee } from "@/lib/payout-fees";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tip } from "@/lib/db/schema";
import { getMonnifyConfig, isMonnifySandbox } from "@/lib/monnify";
import { reportError, reportWarning } from "@/lib/monitoring";
import { reconcilePayoutWithMonnify } from "@/lib/payouts";
import { markTipSettled, reconcileTipWithMonnify } from "@/lib/tips";
import { recordWebhookEvent, finishWebhookEvent } from "@/lib/webhook-events";

const DISBURSEMENT_EVENTS = new Set([
  "SUCCESSFUL_DISBURSEMENT",
  "FAILED_DISBURSEMENT",
  "REVERSED_DISBURSEMENT",
]);

type MonnifyWebhookEvent = {
  eventType?: string;
  eventData?: {
    paymentReference?: string;
    transactionReference?: string;
    amountPaid?: number;
    settlementAmount?: number;
    totalPayable?: number;
    paymentStatus?: string;
    reference?: string;
    status?: string;
    fee?: number;
    totalFee?: number;
    completedOn?: string | null;
  };
};

function signatureMatches(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

async function settleTipFromPayload(event: MonnifyWebhookEvent) {
  const {
    paymentReference,
    transactionReference,
    amountPaid,
    settlementAmount,
    paymentStatus,
  } = event.eventData ?? {};

  if (!paymentReference || paymentStatus !== "PAID") return;

  const row = await db.query.tip.findFirst({
    where: eq(tip.paymentReference, paymentReference),
    columns: { id: true, amount: true, status: true },
  });

  if (!row || row.status !== "pending") return;

  if ((amountPaid ?? 0) < row.amount) {
    reportWarning(`Underpaid tip ${paymentReference}`, {
      category: "webhook.settlement",
      tags: { kind: "underpaid-tip" },
      extra: { paymentReference, amountPaid, expected: row.amount },
      fingerprint: ["webhook-underpaid-tip"],
    });
    return;
  }

  await markTipSettled(row.id, paymentReference, {
    providerReference: transactionReference ?? null,
    amountPaid,
    settlementAmount,
  });
}

async function settlePayoutFromPayload(event: MonnifyWebhookEvent) {
  const { reference, completedOn, fee, totalFee } = event.eventData ?? {};
  if (!reference) return;
  await recordPayoutOutcome(reference, {
    status: event.eventType === "SUCCESSFUL_DISBURSEMENT" ? "paid" : "failed",
    actualProviderFeeAmount: parseProviderFee({ fee, totalFee }),
    completedOn,
    failureReason:
      event.eventType === "REVERSED_DISBURSEMENT"
        ? "The bank reversed this transfer."
        : "The transfer failed.",
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("monnify-signature");
  const { secretKey } = getMonnifyConfig();

  if (!signature && !isMonnifySandbox()) {
    reportWarning("Monnify webhook rejected: missing signature", {
      category: "webhook.signature",
      tags: { reason: "missing" },
      extra: { bodyLength: rawBody.length },
      fingerprint: ["monnify-webhook-invalid-signature"],
    });
    return NextResponse.json({ message: "Missing signature" }, { status: 401 });
  }

  if (signature && !signatureMatches(rawBody, signature, secretKey)) {
    reportWarning("Monnify webhook rejected: invalid signature", {
      category: "webhook.signature",
      tags: { reason: "mismatch" },
      extra: { bodyLength: rawBody.length },
      fingerprint: ["monnify-webhook-invalid-signature"],
    });
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let event: MonnifyWebhookEvent;
  try {
    event = JSON.parse(rawBody) as MonnifyWebhookEvent;
  } catch {
    const eventId = await recordWebhookEvent({
      rawBody,
      parsed: null,
      signatureValid: Boolean(signature),
    });
    await finishWebhookEvent(eventId, "invalid", "Body is not valid JSON");
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const eventId = await recordWebhookEvent({
    rawBody,
    parsed: event,
    signatureValid: Boolean(signature),
  });

  if (event.eventType === "SUCCESSFUL_TRANSACTION") {
    if (signature) {
      try {
        await settleTipFromPayload(event);
      } catch (error) {
        reportError(error, {
          category: "webhook.settlement",
          tags: { eventType: event.eventType },
          extra: { paymentReference: event.eventData?.paymentReference },
        });
        await finishWebhookEvent(eventId, "error", "Tip settlement threw");
        return NextResponse.json(
          { message: "Settlement failed" },
          { status: 500 },
        );
      }
      await finishWebhookEvent(eventId, "settled");
    } else {
      const paymentReference = event.eventData?.paymentReference;

      if (paymentReference) {
        try {
          await reconcileTipWithMonnify(paymentReference);
          await finishWebhookEvent(eventId, "reconciled");
        } catch (error) {
          reportError(error, {
            category: "tip.settlement",
            tags: { kind: "sandbox-webhook" },
            extra: { paymentReference },
          });
          await finishWebhookEvent(eventId, "error", "Tip reconcile threw");
        }
      } else {
        await finishWebhookEvent(eventId, "ignored", "No payment reference");
      }
    }

    return NextResponse.json({ received: true });
  }

  if (event.eventType && DISBURSEMENT_EVENTS.has(event.eventType)) {
    if (signature) {
      try {
        await settlePayoutFromPayload(event);
      } catch (error) {
        reportError(error, {
          category: "webhook.settlement",
          tags: { eventType: event.eventType },
          extra: { reference: event.eventData?.reference },
        });
        await finishWebhookEvent(eventId, "error", "Payout settlement threw");
        return NextResponse.json(
          { message: "Settlement failed" },
          { status: 500 },
        );
      }
      await finishWebhookEvent(eventId, "settled");
    } else {
      const reference = event.eventData?.reference;

      if (reference) {
        try {
          await reconcilePayoutWithMonnify(reference);
          await finishWebhookEvent(eventId, "reconciled");
        } catch (error) {
          reportError(error, {
            category: "payout.reconciliation",
            tags: { kind: "sandbox-webhook" },
            extra: { reference },
          });
          await finishWebhookEvent(eventId, "error", "Payout reconcile threw");
        }
      } else {
        await finishWebhookEvent(eventId, "ignored", "No transfer reference");
      }
    }

    return NextResponse.json({ received: true });
  }

  await finishWebhookEvent(eventId, "ignored", "Unhandled event type");
  return NextResponse.json({ received: true });
}

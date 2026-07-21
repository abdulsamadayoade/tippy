import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { payout, tip } from "@/lib/db/schema";
import { getMonnifyConfig, isMonnifySandbox } from "@/lib/monnify";
import { reconcilePayoutWithMonnify } from "@/lib/payouts";
import { reconcileTipWithMonnify } from "@/lib/tips";

const DISBURSEMENT_EVENTS = new Set([
  "SUCCESSFUL_DISBURSEMENT",
  "FAILED_DISBURSEMENT",
  "REVERSED_DISBURSEMENT",
]);

type MonnifyWebhookEvent = {
  eventType?: string;
  eventData?: {
    // Collections (tips)
    paymentReference?: string;
    transactionReference?: string;
    amountPaid?: number;
    paymentStatus?: string;
    // Disbursements (payouts)
    reference?: string;
    status?: string;
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
  const { paymentReference, transactionReference, amountPaid, paymentStatus } =
    event.eventData ?? {};

  if (!paymentReference || paymentStatus !== "PAID") return;

  const row = await db.query.tip.findFirst({
    where: eq(tip.paymentReference, paymentReference),
    columns: { id: true, amount: true, status: true },
  });

  if (!row || row.status !== "pending") return;

  if ((amountPaid ?? 0) < row.amount) {
    console.warn(
      `Monnify webhook: underpaid tip ${paymentReference} (${amountPaid} < ${row.amount})`,
    );
    return;
  }

  await db
    .update(tip)
    .set({
      status: "success",
      providerReference: transactionReference ?? null,
    })
    .where(and(eq(tip.id, row.id), eq(tip.status, "pending")));
}

async function settlePayoutFromPayload(event: MonnifyWebhookEvent) {
  const { reference, completedOn } = event.eventData ?? {};
  if (!reference) return;

  const openOnly = and(
    eq(payout.paymentReference, reference),
    inArray(payout.status, ["pending", "processing"]),
  );

  if (event.eventType === "SUCCESSFUL_DISBURSEMENT") {
    const paidAt = completedOn ? new Date(completedOn) : null;

    await db
      .update(payout)
      .set({
        status: "paid",
        paidAt: paidAt && !Number.isNaN(paidAt.getTime()) ? paidAt : new Date(),
      })
      .where(openOnly);
    return;
  }

  await db
    .update(payout)
    .set({
      status: "failed",
      failureReason:
        event.eventType === "REVERSED_DISBURSEMENT"
          ? "The bank reversed this transfer."
          : `Provider status: ${event.eventData?.status ?? "FAILED"}`,
    })
    .where(openOnly);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("monnify-signature");
  const { secretKey } = getMonnifyConfig();

  if (!signature && !isMonnifySandbox()) {
    return NextResponse.json({ message: "Missing signature" }, { status: 401 });
  }

  if (signature && !signatureMatches(rawBody, signature, secretKey)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let event: MonnifyWebhookEvent;
  try {
    event = JSON.parse(rawBody) as MonnifyWebhookEvent;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  if (event.eventType === "SUCCESSFUL_TRANSACTION") {
    if (signature) {
      await settleTipFromPayload(event);
    } else {
      // Sandbox events are unsigned, so authenticate the claim with a single
      // authoritative lookup instead of trusting the payload.
      const paymentReference = event.eventData?.paymentReference;

      if (paymentReference) {
        try {
          await reconcileTipWithMonnify(paymentReference);
        } catch (error) {
          console.error("Sandbox webhook reconciliation failed", error);
        }
      }
    }

    return NextResponse.json({ received: true });
  }

  if (event.eventType && DISBURSEMENT_EVENTS.has(event.eventType)) {
    if (signature) {
      await settlePayoutFromPayload(event);
    } else {
      const reference = event.eventData?.reference;

      if (reference) {
        try {
          await reconcilePayoutWithMonnify(reference);
        } catch (error) {
          console.error("Sandbox payout reconciliation failed", error);
        }
      }
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}

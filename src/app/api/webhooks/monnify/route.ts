import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tip } from "@/lib/db/schema";
import { getMonnifyConfig, isMonnifySandbox } from "@/lib/monnify";
import { reconcileTipWithMonnify } from "@/lib/tips";

type MonnifyWebhookEvent = {
  eventType?: string;
  eventData?: {
    paymentReference?: string;
    transactionReference?: string;
    amountPaid?: number;
    paymentStatus?: string;
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

async function settleFromPayload(event: MonnifyWebhookEvent) {
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

  if (event.eventType !== "SUCCESSFUL_TRANSACTION") {
    return NextResponse.json({ received: true });
  }

  if (signature) {
    await settleFromPayload(event);
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

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tip } from "@/lib/db/schema";
import { reconcileTipWithMonnify } from "@/lib/tips";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { reportError } from "@/lib/monitoring";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const ip = getClientIp(request);
  const ipLimit = await consumeRateLimit(`tip:status:ip:${ip}`, {
    window: 60,
    max: 120,
  });
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { status: "pending" },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } },
    );
  }

  const { reference } = await params;

  const row = await db.query.tip.findFirst({
    where: eq(tip.paymentReference, reference),
    columns: { status: true },
  });

  if (!row) {
    return NextResponse.json({ status: "unknown" }, { status: 404 });
  }

  if (row.status !== "pending") {
    return NextResponse.json({ status: row.status });
  }

  try {
    const status = await reconcileTipWithMonnify(reference);
    return NextResponse.json({
      status: status === "unknown" ? "pending" : status,
    });
  } catch (error) {
    reportError(error, {
      category: "tip.settlement",
      tags: { kind: "status-poll" },
      extra: { paymentReference: reference },
      fingerprint: ["tip-poll-reconcile-failed"],
    });
    return NextResponse.json({ status: row.status });
  }
}

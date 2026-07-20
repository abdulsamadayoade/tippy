import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tip } from "@/lib/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;

  const row = await db.query.tip.findFirst({
    where: eq(tip.paymentReference, reference),
    columns: { status: true },
  });

  if (!row) {
    return NextResponse.json({ status: "unknown" }, { status: 404 });
  }

  return NextResponse.json({ status: row.status });
}

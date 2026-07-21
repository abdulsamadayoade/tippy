import { NextResponse } from "next/server";
import { runAutoPayouts } from "@/lib/payouts";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const results = await runAutoPayouts();
  return NextResponse.json({ ran: results.length, results });
}

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { abuseReport, creator } from "@/lib/db/schema";
import { sendAbuseReportEmail } from "@/lib/email";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { reportError } from "@/lib/monitoring";

const reportRequestSchema = z.object({
  username: z.string().trim().toLowerCase().min(1),
  reason: z.enum(["impersonation", "scam", "inappropriate", "spam", "other"]),
  details: z.string().trim().max(500).optional().default(""),
  reporterEmail: z
    .string()
    .trim()
    .pipe(z.union([z.literal(""), z.email().max(254)]))
    .optional()
    .default(""),
  website: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) {
    return NextResponse.json(
      { message: "That report is too large." },
      { status: 413 },
    );
  }

  const ip = getClientIp(request);
  const ipLimit = await consumeRateLimit(`report:create:ip:${ip}`, {
    window: 600,
    max: 5,
  });
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { message: "Too many reports. Please try again later." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message:
          "We couldn’t read your report. Refresh the page and try again.",
      },
      { status: 400 },
    );
  }

  const parsed = reportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Tell us what’s wrong with this page and try again." },
      { status: 422 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const rows = await db
    .select({ id: creator.id })
    .from(creator)
    .where(eq(creator.username, parsed.data.username))
    .limit(1);
  const reported = rows[0];

  if (!reported) {
    return NextResponse.json(
      { message: "This page no longer exists." },
      { status: 404 },
    );
  }

  const [inserted] = await db
    .insert(abuseReport)
    .values({
      creatorId: reported.id,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
      reporterEmail: parsed.data.reporterEmail || null,
    })
    .returning({ id: abuseReport.id });

  try {
    await sendAbuseReportEmail({
      username: parsed.data.username,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
      reporterEmail: parsed.data.reporterEmail || null,
      reportId: inserted.id,
    });
  } catch (error) {
    reportError(error, {
      category: "abuse.report",
      extra: { reportId: inserted.id },
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

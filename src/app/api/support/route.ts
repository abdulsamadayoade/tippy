import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSupportRequestEmail } from "@/lib/email";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const supportRequestSchema = z.object({
  name: z.string().trim().max(100).optional().default(""),
  email: z.email().max(254),
  topic: z.enum(["tips", "payouts", "account", "abuse", "other"]),
  message: z.string().trim().min(1).max(1000),
  website: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) {
    return NextResponse.json(
      { message: "That message is too large." },
      { status: 413 },
    );
  }

  const ip = getClientIp(request);
  const ipLimit = await consumeRateLimit(`support:create:ip:${ip}`, {
    window: 600,
    max: 5,
  });
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { message: "Too many messages. Please try again later." },
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
          "We couldn't read your message. Refresh the page and try again.",
      },
      { status: 400 },
    );
  }

  const parsed = supportRequestSchema.safeParse(body);

  if (!parsed.success) {
    const emailOnly = parsed.error.issues.every(
      (issue) => issue.path[0] === "email",
    );
    return NextResponse.json(
      {
        message: emailOnly
          ? "That email doesn't look right — we need it to reply to you."
          : "Add a message (up to 1,000 characters) and try again.",
      },
      { status: 422 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  try {
    await sendSupportRequestEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      topic: parsed.data.topic,
      message: parsed.data.message,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "We couldn't send your message right now. Email us directly at hello@tippy.cash.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

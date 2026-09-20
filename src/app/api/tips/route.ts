import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { category, creator, tip } from "@/lib/db/schema";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { reportWarning } from "@/lib/monitoring";
import {
  MAXIMUM_TIP,
  MINIMUM_TIP,
  MAXIMUM_NOTE_LENGTH,
} from "@/data/constants";
import { formatNaira } from "@/lib/utils";
import { resolvePresets } from "@/modules/profile/data";

const tipRequestSchema = z.object({
  username: z.string().trim().toLowerCase().min(1),
  amount: z.number().int().min(MINIMUM_TIP).max(MAXIMUM_TIP),
  note: z.string().trim().max(MAXIMUM_NOTE_LENGTH),
  anonymous: z.boolean(),
  tipperName: z.string().trim().max(50).optional().default(""),
  tipperEmail: z
    .string()
    .trim()
    .pipe(z.union([z.literal(""), z.email().max(254)]))
    .optional()
    .default(""),
});

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json(
      { message: "That request is too large." },
      { status: 413 },
    );
  }

  const ip = getClientIp(request);
  const ipLimit = await consumeRateLimit(`tip:create:ip:${ip}`, {
    window: 60,
    max: 10,
  });
  if (!ipLimit.allowed) {
    reportWarning("Tip creation rate-limited by IP", {
      category: "checkout.start",
      tags: { kind: "rate-limit" },
      extra: { ip },
      fingerprint: ["tip-create-rate-limited"],
    });
    return NextResponse.json(
      { message: "Too many tip attempts. Please wait a moment and try again." },
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
          "We couldn’t read that payment request. Refresh the page and try again.",
      },
      { status: 400 },
    );
  }

  const parsed = tipRequestSchema.safeParse(body);

  if (!parsed.success) {
    const emailOnly = parsed.error.issues.every(
      (issue) => issue.path[0] === "tipperEmail",
    );
    return NextResponse.json(
      {
        message: emailOnly
          ? "That receipt email doesn’t look right. Fix it or leave it blank."
          : `Choose an amount between ${formatNaira(MINIMUM_TIP)} and ${formatNaira(MAXIMUM_TIP)} and try again.`,
      },
      { status: 422 },
    );
  }

  const rows = await db
    .select({
      id: creator.id,
      tipPresets: creator.tipPresets,
      allowCustomAmount: creator.allowCustomAmount,
      suspended: creator.suspended,
      categoryName: category.name,
    })
    .from(creator)
    .innerJoin(category, eq(creator.categoryId, category.id))
    .where(eq(creator.username, parsed.data.username))
    .limit(1);
  const tipCreator = rows[0];

  if (!tipCreator || tipCreator.suspended) {
    return NextResponse.json(
      { message: "This creator’s page no longer exists." },
      { status: 404 },
    );
  }

  if (!tipCreator.allowCustomAmount) {
    const presets = resolvePresets(
      tipCreator.tipPresets,
      tipCreator.categoryName,
    );
    if (!presets.some((preset) => preset.amount === parsed.data.amount)) {
      return NextResponse.json(
        { message: "Pick one of the tip amounts on this page and try again." },
        { status: 422 },
      );
    }
  }

  const creatorLimit = await consumeRateLimit(
    `tip:create:creator:${tipCreator.id}`,
    {
      window: 60,
      max: 30,
    },
  );
  if (!creatorLimit.allowed) {
    return NextResponse.json(
      {
        message:
          "This page is getting a lot of tips right now. Try again in a moment.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(creatorLimit.retryAfter) },
      },
    );
  }

  const paymentReference = `TIPPY-${crypto.randomUUID()}`;

  const tipperName = parsed.data.anonymous ? null : parsed.data.tipperName;

  await db.insert(tip).values({
    creatorId: tipCreator.id,
    amount: parsed.data.amount,
    note: parsed.data.note || null,
    anonymous: parsed.data.anonymous,
    tipperName: tipperName || null,
    tipperEmail: parsed.data.tipperEmail || null,
    paymentReference,
  });

  return NextResponse.json(
    {
      paymentReference,
      amount: parsed.data.amount,
      customerFullName: "Tippy Supporter",
      customerEmail:
        parsed.data.tipperEmail ||
        `${paymentReference.toLowerCase()}@guest.tippy.cash`,
    },
    { status: 201 },
  );
}

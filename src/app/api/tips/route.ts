import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { creator, tip } from "@/lib/db/schema";
import {
  MAXIMUM_TIP,
  MINIMUM_TIP,
  MAXIMUM_NOTE_LENGTH,
} from "@/data/constants";
import { formatNaira } from "@/lib/utils";

const tipRequestSchema = z.object({
  username: z.string().trim().toLowerCase().min(1),
  amount: z.number().int().min(MINIMUM_TIP).max(MAXIMUM_TIP),
  note: z.string().trim().max(MAXIMUM_NOTE_LENGTH),
  anonymous: z.boolean(),
});

export async function POST(request: Request) {
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
    return NextResponse.json(
      {
        message: `Choose an amount between ${formatNaira(MINIMUM_TIP)} and ${formatNaira(MAXIMUM_TIP)} and try again.`,
      },
      { status: 422 },
    );
  }

  const tipCreator = await db.query.creator.findFirst({
    where: eq(creator.username, parsed.data.username),
    columns: { id: true },
  });

  if (!tipCreator) {
    return NextResponse.json(
      { message: "This creator’s page no longer exists." },
      { status: 404 },
    );
  }

  const paymentReference = `TIPPY-${crypto.randomUUID()}`;

  await db.insert(tip).values({
    creatorId: tipCreator.id,
    amount: parsed.data.amount,
    note: parsed.data.note || null,
    anonymous: parsed.data.anonymous,
    paymentReference,
  });

  return NextResponse.json(
    {
      paymentReference,
      amount: parsed.data.amount,
      customerFullName: "Tippy Supporter",
      customerEmail: `${paymentReference.toLowerCase()}@guest.tippy.cash`,
    },
    { status: 201 },
  );
}

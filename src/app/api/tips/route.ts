import { NextResponse } from "next/server";
import {
  MAXIMUM_TIP,
  MINIMUM_TIP,
  MAXIMUM_NOTE_LENGTH,
} from "@/data/constants";
import { formatNaira } from "@/lib/utils";

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

  if (!isTipRequest(body)) {
    return NextResponse.json(
      {
        message: `Choose an amount between ${formatNaira(MINIMUM_TIP)} and ${formatNaira(MAXIMUM_TIP)} and try again.`,
      },
      { status: 422 },
    );
  }

  const note = body.note.trim().slice(0, MAXIMUM_NOTE_LENGTH);
  const paymentReference = `TIPPY-${crypto.randomUUID()}`;

  return NextResponse.json(
    {
      paymentReference,
      tip: {
        id: crypto.randomUUID(),
        name: body.anonymous ? "Anonymous" : "You",
        amount: body.amount,
        note,
        anonymous: body.anonymous,
        initial: body.anonymous ? "?" : "Y",
        shade: "strong",
        time: "just now",
        createdAt: new Date().toISOString(),
        reference: paymentReference,
      },
    },
    { status: 201 },
  );
}

function isTipRequest(
  value: unknown,
): value is { amount: number; note: string; anonymous: boolean } {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.amount === "number" &&
    Number.isInteger(candidate.amount) &&
    candidate.amount >= MINIMUM_TIP &&
    candidate.amount <= MAXIMUM_TIP &&
    typeof candidate.note === "string" &&
    candidate.note.length <= MAXIMUM_NOTE_LENGTH &&
    typeof candidate.anonymous === "boolean"
  );
}

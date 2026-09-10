import { z } from "zod";

const moderationSchema = z.object({
  creatorId: z.uuid("Invalid creator."),
  reason: z
    .string()
    .trim()
    .min(5, "Give a reason (at least 5 characters).")
    .max(500, "Keep the reason under 500 characters."),
});

const ADJUSTMENT_TYPES = [
  "refund",
  "reversal",
  "manual_credit",
  "manual_debit",
] as const;

const adjustmentSchema = z.object({
  creatorId: z.uuid("Invalid creator."),
  type: z.enum(ADJUSTMENT_TYPES, { message: "Pick an adjustment type." }),
  amount: z
    .number()
    .int("Whole naira only.")
    .positive("Enter an amount greater than zero."),
  reason: z
    .string()
    .trim()
    .min(10, "Explain the adjustment (at least 10 characters).")
    .max(500, "Keep the reason under 500 characters."),
  relatedReference: z
    .string()
    .trim()
    .max(100, "That reference is too long.")
    .optional(),
  allowNegative: z.boolean().optional(),
});

export { moderationSchema, adjustmentSchema, ADJUSTMENT_TYPES };

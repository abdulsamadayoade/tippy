import { z } from "zod";
import { ACCOUNT_NUMBER_LENGTH, BANKS } from "@/data/constants";

const accountSchema = z.object({
  bank: z.string().refine((value) => BANKS.some(({ name }) => name === value), {
    message: "Select your bank.",
  }),
  accountNumber: z
    .string()
    .regex(
      new RegExp(`^\\d{${ACCOUNT_NUMBER_LENGTH}}$`),
      `Enter your ${ACCOUNT_NUMBER_LENGTH}-digit account number.`,
    ),
});

const verificationSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "Enter your 11-digit BVN."),
  consent: z.literal(true, { error: "Please consent to BVN verification." }),
});

const withdrawalQuoteSchema = z.object({
  bankAmount: z.number().positive(),
  creatorFeeAmount: z.number().nonnegative(),
  balanceDebit: z.number().positive(),
  environment: z.enum(["sandbox", "live"]),
  feePolicyVersion: z.string(),
  destinationId: z.uuid(),
  destinationRevision: z.number().int().positive(),
  destinationBank: z.string(),
  destinationLast4: z.string().regex(/^\d{4}$/),
});

export { accountSchema, verificationSchema, withdrawalQuoteSchema };

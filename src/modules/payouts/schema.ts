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
  accountName: z.string().trim().min(2, "Enter the account holder’s name."),
});

export { accountSchema };

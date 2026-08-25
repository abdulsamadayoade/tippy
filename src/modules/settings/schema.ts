import { z } from "zod";
import { formatNaira } from "@/lib/utils";
import { MAXIMUM_TIP, MINIMUM_TIP } from "@/data/constants";
import { BIO_MAX_LENGTH } from "@/modules/onboarding/data";
import { PRESET_LABEL_MAX_LENGTH } from "@/modules/profile/data";

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter your display name.")
    .max(50, "Your display name can’t be longer than 50 characters."),
  categoryId: z.uuid("Pick a category from the list."),
  bio: z
    .string()
    .trim()
    .max(
      BIO_MAX_LENGTH,
      `Your bio can’t be longer than ${BIO_MAX_LENGTH} characters.`,
    ),
});

const presetSlotSchema = z.object({
  amount: z
    .number()
    .int()
    .min(
      MINIMUM_TIP,
      `Each amount needs to be at least ${formatNaira(MINIMUM_TIP)}.`,
    )
    .max(
      MAXIMUM_TIP,
      `Each amount can’t be more than ${formatNaira(MAXIMUM_TIP)}.`,
    ),
  label: z
    .string()
    .trim()
    .min(1, "Add a short label.")
    .max(
      PRESET_LABEL_MAX_LENGTH,
      `Keep labels under ${PRESET_LABEL_MAX_LENGTH} characters.`,
    ),
});

const presetsSchema = z
  .tuple([
    presetSlotSchema,
    presetSlotSchema,
    presetSlotSchema,
    presetSlotSchema,
  ])
  .refine(
    (presets) =>
      new Set(presets.map(({ amount }) => amount)).size === presets.length,
    "Each preset needs a different amount.",
  );

export { profileSchema, presetsSchema };

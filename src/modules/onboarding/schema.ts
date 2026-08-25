import { z } from "zod";
import {
  BIO_MAX_LENGTH,
  RESERVED_USERNAMES,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "./data";

const usernameSchema = z
  .string()
  .trim()
  .min(
    USERNAME_MIN_LENGTH,
    `Your username needs at least ${USERNAME_MIN_LENGTH} characters.`,
  )
  .max(
    USERNAME_MAX_LENGTH,
    `Your username can’t be longer than ${USERNAME_MAX_LENGTH} characters.`,
  )
  .regex(USERNAME_PATTERN, "Only letters, numbers, and underscores.")
  .transform((value) => value.toLowerCase())
  .refine(
    (value) => !RESERVED_USERNAMES.includes(value),
    "That username isn’t available.",
  );

const onboardingSchema = z.object({
  username: usernameSchema,
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

export { usernameSchema, onboardingSchema };

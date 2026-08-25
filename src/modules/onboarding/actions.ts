"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema";
import { deleteAvatarBlob, processAndUploadAvatar } from "@/lib/avatar";
import { getSessionCreator } from "@/lib/session";
import {
  BIO_MAX_LENGTH,
  RESERVED_USERNAMES,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "./data";
import type { OnboardingError } from "./types";

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

function pgErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { code?: unknown; cause?: unknown };
  if (typeof candidate.code === "string") return candidate.code;
  return pgErrorCode(candidate.cause);
}

export async function checkUsernameAvailability(rawUsername: string) {
  const parsed = usernameSchema.safeParse(rawUsername);

  if (!parsed.success) {
    return {
      available: false as const,
      message:
        parsed.error.issues[0]?.message ?? "Choose a different username.",
    };
  }

  const existing = await db.query.creator.findFirst({
    where: eq(creator.username, parsed.data),
    columns: { id: true },
  });

  if (existing) {
    return { available: false as const, message: "That username is taken." };
  }

  return { available: true as const };
}

export async function completeOnboarding(
  formData: FormData,
): Promise<{ error: OnboardingError }> {
  const { session, creator: existingCreator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (existingCreator) redirect("/overview");

  const parsed = onboardingSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    categoryId: formData.get("categoryId"),
    bio: formData.get("bio") ?? "",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: {
        field: issue?.path[0] === "username" ? "username" : "form",
        message: issue?.message ?? "Check the form and try again.",
      },
    };
  }

  let avatarUrl: string | null = null;
  const photo = formData.get("photo");

  if (photo instanceof File && photo.size > 0) {
    const uploaded = await processAndUploadAvatar(photo, session.user.id);
    if (!uploaded.ok) {
      return { error: { field: "form", message: uploaded.error } };
    }
    avatarUrl = uploaded.url;
  }

  try {
    await db.insert(creator).values({
      userId: session.user.id,
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      categoryId: parsed.data.categoryId,
      bio: parsed.data.bio || null,
      avatarUrl,
    });
  } catch (error) {
    // The blob was uploaded before the insert; don't orphan it.
    await deleteAvatarBlob(avatarUrl);
    if (pgErrorCode(error) === "23505") {
      return {
        error: { field: "username", message: "That username is taken." },
      };
    }
    if (pgErrorCode(error) === "23503") {
      return {
        error: { field: "form", message: "Pick a category from the list." },
      };
    }
    throw error;
  }

  redirect("/overview");
}

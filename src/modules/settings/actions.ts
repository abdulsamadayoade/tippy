"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema";
import { getSessionCreator } from "@/lib/session";
import { deleteAvatarBlob, processAndUploadAvatar } from "@/lib/avatar";
import { profileSchema, presetsSchema } from "./schema";
import type { PresetFormErrors, ProfileFormErrors } from "./types";

function pgErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { code?: unknown; cause?: unknown };
  if (typeof candidate.code === "string") return candidate.code;
  return pgErrorCode(candidate.cause);
}

function revalidateTipPage(username: string) {
  revalidatePath("/settings");
  revalidatePath(`/${username}`);
}

export async function updateProfile(values: {
  displayName: string;
  categoryId: string;
  bio: string;
}): Promise<{ errors?: ProfileFormErrors }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { errors: { form: "Sign in and try again." } };

  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    const errors: ProfileFormErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        field === "displayName" ||
        field === "categoryId" ||
        field === "bio"
      ) {
        errors[field] ??= issue.message;
      }
    }
    return { errors };
  }

  try {
    await db
      .update(creator)
      .set({
        displayName: parsed.data.displayName,
        categoryId: parsed.data.categoryId,
        bio: parsed.data.bio || null,
      })
      .where(eq(creator.id, sessionCreator.id));
  } catch (error) {
    if (pgErrorCode(error) === "23503") {
      return { errors: { categoryId: "Pick a category from the list." } };
    }
    throw error;
  }

  // The account menu in the creator layout shows the display name everywhere.
  revalidatePath("/overview");
  revalidatePath("/tips");
  revalidatePath("/payouts");
  revalidateTipPage(sessionCreator.username);
  return {};
}

export async function updateTipPresets(
  presets: { amount: number; label: string }[],
): Promise<{ errors?: PresetFormErrors }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { errors: { form: "Sign in and try again." } };

  const parsed = presetsSchema.safeParse(presets);

  if (!parsed.success) {
    const errors: PresetFormErrors = {};
    for (const issue of parsed.error.issues) {
      const [slot, field] = issue.path;
      if (
        typeof slot === "number" &&
        (field === "amount" || field === "label")
      ) {
        const slots = (errors.slots ??= {});
        const entry = (slots[slot] ??= {});
        entry[field] ??= issue.message;
      } else {
        errors.form ??= issue.message;
      }
    }
    return { errors };
  }

  await db
    .update(creator)
    .set({ tipPresets: parsed.data })
    .where(eq(creator.id, sessionCreator.id));

  revalidateTipPage(sessionCreator.username);
  return {};
}

export async function resetTipPresets(): Promise<{ error?: string }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { error: "Sign in and try again." };

  await db
    .update(creator)
    .set({ tipPresets: null })
    .where(eq(creator.id, sessionCreator.id));

  revalidateTipPage(sessionCreator.username);
  return {};
}

export async function setAllowCustomAmount(
  enabled: boolean,
): Promise<{ error?: string }> {
  const { creator: sessionCreator } = await getSessionCreator();
  if (!sessionCreator) return { error: "Sign in and try again." };

  await db
    .update(creator)
    .set({ allowCustomAmount: enabled })
    .where(eq(creator.id, sessionCreator.id));

  revalidateTipPage(sessionCreator.username);
  return {};
}

export async function changeAvatar(
  formData: FormData,
): Promise<{ error?: string }> {
  const { session, creator: sessionCreator } = await getSessionCreator();

  if (!session || !sessionCreator) {
    return { error: "Sign in and try again." };
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "Choose a photo to upload." };
  }

  const uploaded = await processAndUploadAvatar(photo, session.user.id);
  if (!uploaded.ok) {
    return { error: uploaded.error };
  }

  const previousUrl = sessionCreator.avatarUrl;

  try {
    await db
      .update(creator)
      .set({ avatarUrl: uploaded.url })
      .where(eq(creator.id, sessionCreator.id));
  } catch (error) {
    // The row still points at the old photo, so the new blob is the orphan.
    await deleteAvatarBlob(uploaded.url);
    throw error;
  }

  // Only after the row points at the new photo; best-effort.
  if (previousUrl && previousUrl !== uploaded.url) {
    await deleteAvatarBlob(previousUrl);
  }

  revalidatePath("/overview");
  revalidatePath("/tips");
  revalidatePath("/payouts");
  revalidatePath("/settings");
  revalidatePath(`/${sessionCreator.username}`);

  return {};
}

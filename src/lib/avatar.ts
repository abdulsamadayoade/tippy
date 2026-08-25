import sharp from "sharp";
import { del, put } from "@vercel/blob";
import { reportError } from "@/lib/monitoring";

export const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

const MAX_INPUT_PIXELS = 50_000_000;
const AVATAR_SIZE = 512;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

type AvatarUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function processAndUploadAvatar(
  file: File,
  userId: string,
): Promise<AvatarUploadResult> {
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Your profile photo must be 4MB or smaller." };
  }

  let webp: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    });

    const { format } = await image.metadata();
    if (!format || !ALLOWED_FORMATS.has(format)) {
      return {
        ok: false,
        error: "Use a JPEG, PNG, or WebP image for your profile photo.",
      };
    }

    webp = await image
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return {
      ok: false,
      error: "We couldn’t read that image. Try a different photo.",
    };
  }

  try {
    const blob = await put(`avatars/${userId}.webp`, webp, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/webp",
    });
    return { ok: true, url: blob.url };
  } catch (error) {
    reportError(error, { category: "avatar.upload", extra: { userId } });
    return {
      ok: false,
      error: "We couldn’t save your photo right now. Try again in a moment.",
    };
  }
}

export async function deleteAvatarBlob(url: string | null): Promise<void> {
  if (!url) return;

  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      !parsed.hostname.endsWith(BLOB_HOST_SUFFIX) ||
      !parsed.pathname.startsWith("/avatars/")
    ) {
      return;
    }
    await del(url);
  } catch (error) {
    reportError(error, { category: "avatar.delete", extra: { url } });
  }
}

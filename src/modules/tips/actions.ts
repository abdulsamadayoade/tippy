"use server";

import { z } from "zod";
import { getTipsPage } from "@/lib/dashboard";
import { getSessionCreator } from "@/lib/session";
import type { TipsPage } from "@/types";

const pageRequestSchema = z.object({
  filter: z.enum(["all", "notes", "anonymous"]),
  cursor: z.object({ createdAt: z.iso.datetime(), id: z.uuid() }).nullable(),
  loadedCount: z.number().int().min(0).max(100_000),
});

export async function fetchTipsPage(
  request: z.infer<typeof pageRequestSchema>,
): Promise<{ error: string } | TipsPage> {
  const { creator } = await getSessionCreator();
  if (!creator) return { error: "Sign in and try again." };

  const parsed = pageRequestSchema.safeParse(request);
  if (!parsed.success) return { error: "Couldn’t load tips. Try again." };

  const { filter, cursor, loadedCount } = parsed.data;
  return getTipsPage(creator.id, { filter, cursor, shadeOffset: loadedCount });
}

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { category, creator } from "@/lib/db/schema";
import type { PublicCreator } from "./types";

// Server-only (imports the pg client) — keep out of ./data, which the client
// bundle pulls in through the Profile component.
export const getCreatorByUsername = cache(
  async (rawUsername: string): Promise<PublicCreator | null> => {
    const rows = await db
      .select({
        displayName: creator.displayName,
        username: creator.username,
        bio: creator.bio,
        avatarUrl: creator.avatarUrl,
        categoryName: category.name,
        tipPresets: creator.tipPresets,
        allowCustomAmount: creator.allowCustomAmount,
        suspended: creator.suspended,
      })
      .from(creator)
      .innerJoin(category, eq(creator.categoryId, category.id))
      .where(eq(creator.username, rawUsername.toLowerCase()))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const { suspended, ...publicCreator } = row;
    // Suspended pages 404 like missing ones — suspension isn't revealed.
    if (suspended) return null;

    return publicCreator;
  },
);

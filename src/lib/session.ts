import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema";

const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Deliberately NOT wrapped in cache(): server actions mutate the creator row
 * and then render the redirect target (or revalidated pages) within the same
 * request, so a cached pre-mutation read would serve a stale creator to that
 * render. The session lookup above stays cached — actions never mutate it.
 */
const getSessionCreator = async () => {
  const session = await getSession();

  if (!session) {
    return { session: null, creator: null } as const;
  }

  const creatorRow = await db.query.creator.findFirst({
    where: eq(creator.userId, session.user.id),
  });

  return { session, creator: creatorRow ?? null } as const;
};

export { getSession, getSessionCreator };

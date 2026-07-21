import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema";

const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

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

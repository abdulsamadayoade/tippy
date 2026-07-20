import { cache } from "react";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { category, creator } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { Profile } from "@/modules/profile";
import type { PublicCreator } from "@/modules/profile/types";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ username: string }>;
};

const getCreatorByUsername = cache(
  async (rawUsername: string): Promise<PublicCreator | null> => {
    const rows = await db
      .select({
        displayName: creator.displayName,
        username: creator.username,
        bio: creator.bio,
        avatarUrl: creator.avatarUrl,
        categoryName: category.name,
      })
      .from(creator)
      .innerJoin(category, eq(creator.categoryId, category.id))
      .where(eq(creator.username, rawUsername.toLowerCase()))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return row;
  },
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const tipCreator = await getCreatorByUsername(username);

  if (!tipCreator) return { title: "Tip" };

  return {
    title: `Tip ${tipCreator.displayName}`,
    description: `Send ${tipCreator.displayName} a secure tip in naira and add a personal note.`,
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const tipCreator = await getCreatorByUsername(username);

  if (!tipCreator) notFound();

  const session = await getSession();

  return <Profile creator={tipCreator} viewerSignedIn={Boolean(session)} />;
}

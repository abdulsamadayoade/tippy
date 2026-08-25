import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { Profile } from "@/modules/profile";
import { getCreatorByUsername } from "@/modules/profile/queries";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const tipCreator = await getCreatorByUsername(username);

  if (!tipCreator) return { title: "Tip" };

  const title = `Tip ${tipCreator.displayName}`;
  const description = `Send ${tipCreator.displayName} a secure tip in naira and add a personal note.`;
  // DB-cased username, so /JohnDoe canonicalizes to /johndoe.
  const path = `/${tipCreator.username}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      // Repeated from the root layout — metadata merging is shallow per
      // top-level key, so defining openGraph here replaces it wholesale.
      siteName: "Tippy",
      locale: "en_NG",
      type: "profile",
      username: tipCreator.username,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const tipCreator = await getCreatorByUsername(username);

  if (!tipCreator) notFound();

  const session = await getSession();

  const monnifyApiKey = process.env.MONNIFY_API_KEY;
  const monnifyContractCode = process.env.MONNIFY_CONTRACT_CODE;
  const monnify =
    monnifyApiKey && monnifyContractCode
      ? { apiKey: monnifyApiKey, contractCode: monnifyContractCode }
      : null;

  return (
    <Profile
      creator={tipCreator}
      viewerSignedIn={Boolean(session)}
      monnify={monnify}
    />
  );
}

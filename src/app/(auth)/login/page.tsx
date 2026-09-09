import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionCreator } from "@/lib/session";
import { SignIn } from "@/modules/auth/components/sign-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Tippy with Google or a one-tap email link — no password to remember.",
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ username?: string | string[] }>;
}) {
  const { session, creator } = await getSessionCreator();

  if (session) redirect(creator ? "/overview" : "/onboarding");

  const { username } = await searchParams;
  const claimUsername = Array.isArray(username) ? username[0] : username;

  if (claimUsername) {
    redirect(`/register?username=${encodeURIComponent(claimUsername)}`);
  }

  return (
    <Suspense>
      <SignIn mode="sign-in" />
    </Suspense>
  );
}

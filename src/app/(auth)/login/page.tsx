import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionCreator } from "@/lib/session";
import { SignIn } from "@/modules/auth/components/sign-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Tippy with a one-tap email link — no password to remember.",
};

export default async function Login() {
  const { session, creator } = await getSessionCreator();

  if (session) redirect(creator ? "/overview" : "/onboarding");

  return (
    <Suspense>
      <SignIn mode="sign-in" />
    </Suspense>
  );
}

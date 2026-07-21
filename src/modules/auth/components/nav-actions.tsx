"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function AuthNavActions() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);

    const { error } = await authClient.signOut();
    if (error) {
      setSigningOut(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  if (pathname.startsWith("/onboarding")) {
    return (
      <Button
        variant="secondary"
        size="xs"
        loading={signingOut}
        loadingText="Signing out…"
        onClick={signOut}>
        Log out
      </Button>
    );
  }

  if (pathname.startsWith("/register")) {
    return (
      <ButtonLink variant="secondary" size="xs" href="/login">
        Login
      </ButtonLink>
    );
  }

  return (
    <ButtonLink variant="secondary" size="xs" href="/register">
      Claim your link
    </ButtonLink>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, ButtonLink } from "../ui/button";
import { SoundToggle } from "../ui/sound-toggle";
import { ThemeToggle } from "../ui/theme-toggle";
import { Logo } from "../elements/logo";

type NavProps = {
  signedIn?: boolean;
};

export function Nav({ signedIn = false }: NavProps) {
  return (
    <nav
      className="mx-auto flex w-full max-w-180 items-center justify-between gap-3 px-5.5 py-5"
      aria-label="Main">
      <Link href="/">
        <Logo />
      </Link>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
        <NavLinks signedIn={signedIn} />
        <div className="flex shrink-0 items-center gap-2">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

function NavLinks({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) return <SignOutButton />;

  if (signedIn) {
    return (
      <ButtonLink variant="secondary" size="xs" href="/overview">
        Dashboard
      </ButtonLink>
    );
  }

  return (
    <>
      {pathname !== "/login" && (
        <ButtonLink variant="secondary" size="xs" href="/login">
          Login
        </ButtonLink>
      )}
      {pathname !== "/register" && (
        <ButtonLink variant="secondary" size="xs" href="/register">
          Claim my link
        </ButtonLink>
      )}
    </>
  );
}

function SignOutButton() {
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

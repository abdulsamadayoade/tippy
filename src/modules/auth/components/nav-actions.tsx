"use client";

import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";

export function AuthNavActions() {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) {
    return (
      <ButtonLink variant="secondary" size="xs" href="/dashboard">
        Go to dashboard
      </ButtonLink>
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

import { Nav } from "@/components/layout/nav";
import { ButtonLink } from "@/components/ui/button";
import type { ReactNode } from "react";

export default function LegalLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col justify-between">
      <Nav>
        <ButtonLink variant="secondary" size="xs" href="/login">
          Login
        </ButtonLink>
      </Nav>
      {children}
    </div>
  );
}

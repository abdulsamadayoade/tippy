import { Nav } from "@/components/layout/nav";
import type { ReactNode } from "react";

export default function LegalLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col justify-between">
      <Nav />
      {children}
    </div>
  );
}

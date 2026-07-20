import Link from "next/link";
import { Logo } from "@/components/elements/logo";
import { CreatorAccountMenu } from "@/modules/creator/account-menu";
import { CreatorNavigation } from "@/modules/creator/navigation";
import type { ReactNode } from "react";

export default function CreatorLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="min-h-screen bg-white" id="main-content">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-160 items-center gap-5.5 px-5.5 py-3 max-[680px]:flex-wrap max-[680px]:gap-2.5 max-[680px]:px-4 max-[680px]:pt-3 max-[680px]:pb-2.5">
          <Link href="/overview">
            <Logo />
          </Link>
          <CreatorNavigation />
          <div className="ml-auto flex items-center gap-3.5">
            <CreatorAccountMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-160 px-5.5 pt-7 pb-15 max-[640px]:px-4 max-[640px]:pt-6 max-[640px]:pb-12">
        {children}
      </div>
    </main>
  );
}

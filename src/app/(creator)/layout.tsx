import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/elements/logo";
import { CreatorAccountMenu } from "@/modules/creator/components/account-menu";
import { CreatorNavigation } from "@/modules/creator/components/navigation";
import { getSessionCreator } from "@/lib/session";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function CreatorLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { session, creator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (!creator) redirect("/onboarding");

  return (
    <main className="min-h-screen bg-white" id="main-content">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-160 items-center gap-5.5 px-5.5 py-3 max-dashboard:flex-wrap max-dashboard:gap-2.5 max-dashboard:px-4 max-dashboard:pt-3 max-dashboard:pb-2.5">
          <Link href="/overview">
            <Logo />
          </Link>
          <CreatorNavigation />
          <div className="ml-auto flex items-center gap-3.5">
            <CreatorAccountMenu
              displayName={creator.displayName}
              username={creator.username}
              tipUrl={`tippy.cash/${creator.username}`}
              avatarUrl={creator.avatarUrl}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-160 px-5.5 pt-7 pb-15 max-sm:px-4 max-sm:pt-6 max-sm:pb-12">
        {creator.suspended && (
          <div
            className="mb-6 rounded-md bg-danger-soft px-4 py-2 text-sm leading-normal text-danger"
            role="status">
            Your account is suspended — payouts and your public page are paused.
            Contact hello@tippy.cash if you think this is a mistake.
          </div>
        )}
        {children}
      </div>
    </main>
  );
}

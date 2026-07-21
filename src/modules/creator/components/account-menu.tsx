"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { authClient } from "@/lib/auth-client";
import { useMenuState } from "@/hooks/use-menu-state";
import { CreatorAvatar } from "@/components/ui/creator-avatar";
import { LogoutIcon } from "@/components/icons/logout";
import type { CreatorAccountMenuProps } from "../types";

export function CreatorAccountMenu({
  displayName,
  tipUrl,
  avatarUrl,
}: CreatorAccountMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const { state, toggle, beginClose, containerRef, triggerRef } =
    useMenuState();

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);

    const { error } = await authClient.signOut();
    if (error) {
      setSigningOut(false);
      beginClose();
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        className="flex cursor-pointer items-center rounded-full transition-opacity duration-150 hover:opacity-90"
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={state === "open"}
        onClick={toggle}>
        <CreatorAvatar
          size="small"
          name={displayName}
          photoUrl={avatarUrl}
          loading="eager"
        />
      </button>

      <div
        role="menu"
        aria-label="Account"
        data-origin="top-right"
        inert={state === "closed"}
        className={cn(
          "t-dropdown absolute top-full right-0 z-30 mt-2 min-w-56 rounded-2xl border border-line bg-white p-1 shadow-[0_16px_44px_-16px_rgba(41,41,41,0.32)]",
          state === "open" && "is-open",
          state === "closing" && "is-closing",
        )}>
        <div className="min-w-0 px-2.5 py-2">
          <p className="truncate text-sm font-medium text-main-heading">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted-text">{tipUrl}</p>
        </div>
        <div className="my-1 h-px bg-line" />
        <button
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-ui-sm font-medium text-body-text transition-colors duration-100 hover:bg-soft disabled:cursor-default disabled:opacity-60"
          role="menuitem"
          type="button"
          disabled={signingOut}
          onClick={signOut}>
          <LogoutIcon className="size-4" />
          {signingOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { CreatorAvatar } from "@/components/ui/creator-avatar";
import { LogoutIcon } from "@/components/icons/logout";
import { sampleCreator } from "@/data";

export function CreatorAccountMenu() {
  const router = useRouter();
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function beginClose() {
    setState((current) => (current === "open" ? "closing" : current));
  }

  function toggle() {
    setState((current) => (current === "open" ? "closing" : "open"));
  }

  useEffect(() => {
    if (state !== "closing") return;
    const id = window.setTimeout(() => setState("closed"), 130);
    return () => window.clearTimeout(id);
  }, [state]);

  useEffect(() => {
    if (state !== "open") return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) beginClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        beginClose();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [state]);

  function signOut() {
    beginClose();
    router.push("/login");
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
          name={sampleCreator.name}
          photoUrl={sampleCreator.profilePhotoUrl}
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
            {sampleCreator.name}
          </p>
          <p className="truncate text-xs text-muted-text">
            {sampleCreator.tipUrl}
          </p>
        </div>
        <div className="my-1 h-px bg-line" />
        <button
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium text-body-text transition-colors duration-100 hover:bg-soft"
          role="menuitem"
          type="button"
          onClick={signOut}>
          <LogoutIcon className="size-4" />
          Log out
        </button>
      </div>
    </div>
  );
}

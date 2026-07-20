"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { EditIcon } from "@/components/icons/edit";
import { TrashIcon } from "@/components/icons/trash";
import { MoreIcon } from "@/components/icons/more";
import type { AccountMenuProps } from "../types";

export function AccountMenu({ onEdit, onRemove }: AccountMenuProps) {
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

  function select(action: () => void) {
    beginClose();
    action();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account options"
        aria-haspopup="menu"
        aria-expanded={state === "open"}
        onClick={toggle}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-text transition-colors duration-150 hover:bg-soft hover:text-body-text">
        <MoreIcon className="size-4" />
      </button>

      <div
        role="menu"
        aria-label="Account options"
        data-origin="top-right"
        inert={state === "closed"}
        className={cn(
          "t-dropdown absolute top-full right-0 z-30 mt-1.5 min-w-44 rounded-2xl border border-line bg-white p-1 shadow-[0_16px_44px_-16px_rgba(41,41,41,0.32)]",
          state === "open" && "is-open",
          state === "closing" && "is-closing",
        )}>
        <button
          role="menuitem"
          type="button"
          onClick={() => select(onEdit)}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-ui-sm font-medium text-body-text transition-colors duration-100 hover:bg-soft">
          <EditIcon className="size-4" />
          Edit account
        </button>
        <button
          role="menuitem"
          type="button"
          onClick={() => select(onRemove)}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-ui-sm font-medium text-danger transition-colors duration-100 hover:bg-danger-soft">
          <TrashIcon className="size-4" />
          Remove
        </button>
      </div>
    </div>
  );
}

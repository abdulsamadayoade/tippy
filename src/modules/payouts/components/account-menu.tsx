"use client";

import { useMenuState } from "@/hooks/use-menu-state";
import { Dropdown } from "@/components/ui/dropdown";
import { EditIcon } from "@/components/icons/edit";
import { TrashIcon } from "@/components/icons/trash";
import { MoreIcon } from "@/components/icons/more";
import type { AccountMenuProps } from "../types";

export function AccountMenu({ onEdit, onRemove }: AccountMenuProps) {
  const { state, toggle, beginClose, containerRef, triggerRef } = useMenuState();

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
        data-cuelume-toggle="tick"
        onClick={toggle}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-text transition-colors duration-150 hover:bg-soft hover:text-body-text">
        <MoreIcon className="size-4" />
      </button>

      <Dropdown
        aria-label="Account options"
        origin="top-right"
        state={state}
        className="absolute top-full right-0 z-30 mt-1.5 min-w-44 rounded-2xl bg-menu-bg p-1 shadow-menu">
        <button
          role="menuitem"
          type="button"
          data-cuelume-toggle="tick"
          onClick={() => select(onEdit)}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-ui-sm font-medium text-body-text transition-colors duration-100 hover:bg-soft">
          <EditIcon className="size-4" />
          Edit account
        </button>
        <button
          role="menuitem"
          type="button"
          data-cuelume-toggle="tick"
          onClick={() => select(onRemove)}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-ui-sm font-medium text-red-600 dark:text-red-800 transition-colors duration-100 hover:bg-danger-soft">
          <TrashIcon className="size-4" />
          Remove
        </button>
      </Dropdown>
    </div>
  );
}

"use client";

import { cn } from "@/lib/cn";
import { useMenuState } from "@/hooks/use-menu-state";
import { CheckIcon } from "@/components/icons/check";
import { ChevronDownIcon } from "@/components/icons/chevron-down";
import { PERIOD_LABELS, PERIOD_OPTIONS } from "../data";
import type { PeriodMenuProps, TipPeriod } from "../types";

export function PeriodMenu({ period, onPeriodChange }: PeriodMenuProps) {
  const { state, toggle, beginClose, containerRef, triggerRef } =
    useMenuState();

  function select(nextPeriod: TipPeriod) {
    beginClose();
    onPeriodChange(nextPeriod);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        className="flex cursor-pointer items-center gap-1 text-xs font-medium tracking-[0.03em] text-white/55 uppercase transition-colors duration-150 hover:text-white/85"
        type="button"
        aria-label="Change tips period"
        aria-haspopup="menu"
        aria-expanded={state === "open"}
        onClick={toggle}>
        {PERIOD_LABELS[period]}
        <ChevronDownIcon className="size-3.5" aria-hidden="true" />
      </button>

      <div
        role="menu"
        aria-label="Tips period"
        inert={state === "closed"}
        className={cn(
          "t-dropdown absolute top-full left-0 z-30 mt-1.5 min-w-40 rounded-2xl border border-line bg-white p-1 text-left normal-case shadow-[0_16px_44px_-16px_rgba(41,41,41,0.32)]",
          state === "open" && "is-open",
          state === "closing" && "is-closing",
        )}>
        {PERIOD_OPTIONS.map(({ value, label }) => {
          const selected = value === period;

          return (
            <button
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium tracking-normal transition-colors duration-100 hover:bg-soft",
                selected ? "text-main-heading" : "text-body-text",
              )}
              key={value}
              role="menuitemradio"
              type="button"
              aria-checked={selected}
              onClick={() => select(value)}>
              {label}
              {selected ? (
                <CheckIcon className="size-4 stroke-2" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

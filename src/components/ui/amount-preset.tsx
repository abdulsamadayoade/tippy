"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatNaira } from "@/lib/utils";

export type AmountPresetProps = {
  amount: number;
  label: ReactNode;
  popular?: boolean;
  selected: boolean;
  onSelect: () => void;
  className?: string;
};

export function AmountPreset({
  amount,
  label,
  popular = false,
  selected,
  onSelect,
  className,
}: AmountPresetProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-17.25 cursor-pointer flex-col items-start gap-0.5 rounded-[14px] px-3.5 py-3.25 text-left transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-px",
        selected
          ? "bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_6px_rgba(0,0,0,0.18)]"
          : "bg-white text-main-heading shadow-surface",
        className,
      )}>
      <span className="flex w-full items-center justify-between gap-1.5">
        <span className="text-lg font-medium tracking-display">
          {formatNaira(amount)}
        </span>
        {popular && (
          <span className="rounded-full px-2 py-0.75 text-xs leading-none font-medium whitespace-nowrap">
            Popular
          </span>
        )}
      </span>
      <span
        className={cn(
          "text-xs",
          selected ? "text-white/56" : "text-muted-text",
        )}>
        {label}
      </span>
    </button>
  );
}

"use client";

import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SwitchProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "onChange" | "type" | "role" | "aria-checked"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  labelClassName?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  className,
  labelClassName,
  disabled,
  ...props
}: SwitchProps) {
  const hasText = Boolean(label || description);
  // prevent the travel keyframes so the "off" animation doesn't play on mount.
  const [interacted, setInteracted] = useState(false);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        setInteracted(true);
        onCheckedChange(!checked);
      }}
      className={cn(
        "flex cursor-pointer items-center gap-3 bg-transparent p-0 text-left disabled:cursor-not-allowed disabled:opacity-60",
        hasText && "w-full justify-between",
        className,
      )}
      {...props}>
      {hasText && (
        <span
          className={cn(
            "flex flex-col text-sm font-medium text-main-heading",
            labelClassName,
          )}>
          {label && <span>{label}</span>}
          {description && (
            <small className="mt-px text-xs font-normal text-muted-text">
              {description}
            </small>
          )}
        </span>
      )}

      <span
        className={cn(
          "t-toggle relative h-6 w-12 shrink-0 rounded-full",
          interacted && "is-init",
          checked ? "bg-primary" : "bg-line",
        )}
        data-on={checked ? "true" : "false"}
        aria-hidden="true">
        <span className="t-toggle-thumb absolute top-1 left-1 h-4 w-6 rounded-full bg-white shadow-[0_1px_2px_rgba(41,41,41,0.25)]" />
      </span>
    </button>
  );
}

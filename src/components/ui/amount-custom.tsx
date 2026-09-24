"use client";

import { useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AmountCustomProps = {
  value: number;
  selected: boolean;
  onSelect: () => void;
  onValueChange: (amount: number) => void;
  max?: number;
  error?: ReactNode;
  className?: string;
};

export function AmountCustom({
  value,
  selected,
  onSelect,
  onValueChange,
  max = Number.MAX_SAFE_INTEGER,
  error,
  className,
}: AmountCustomProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    onValueChange(digits ? Math.min(Number(digits), max) : 0);
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "flex min-h-17.25 cursor-text flex-col justify-center gap-0.5 rounded-surface px-3.5 py-3.25 transition-[background-color,box-shadow,transform] duration-150",
          selected
            ? "bg-primary text-white  shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_6px_rgba(0,0,0,0.18)] focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_6px_rgba(0,0,0,0.18),0_0_0_4px_rgba(6,78,91,0.16)]"
            : "cursor-pointer bg-card-bg text-main-heading shadow-surface hover:-translate-y-px focus-within:shadow-[inset_0_0_0_1px_var(--color-primary),0_0_0_4px_rgba(6,78,91,0.12),0_4px_12px_rgba(6,78,91,0.08)]",
        )}
        data-cuelume-toggle={selected ? undefined : "tick"}
        onMouseDown={(event) => {
          if (event.target === inputRef.current) return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
        onClick={() => {
          if (!selected) onSelect();
        }}>
        <label className="sr-only" htmlFor={id}>
          Custom amount
        </label>

        <span className="flex w-full items-center">
          {selected && (
            <span
              className="mr-1 text-lg font-medium text-white/56"
              aria-hidden="true">
              ₦
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            className={cn(
              "min-w-0 flex-1 border-0 bg-transparent p-0 text-lg font-medium tracking-display tabular-nums outline-none",
              selected
                ? "caret-current placeholder:text-white/40"
                : "cursor-pointer placeholder:text-main-heading",
            )}
            name="amount"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={selected ? "0" : "Custom amount"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            value={selected && value > 0 ? value.toLocaleString("en-NG") : ""}
            onChange={(event) => handleChange(event.target.value)}
          />
          {selected && (
            <span
              className="ml-2 text-xs font-medium text-white/56"
              aria-hidden="true">
              NGN
            </span>
          )}
        </span>

        <span
          className={cn(
            "text-xs",
            selected ? "text-white/56" : "text-muted-text",
          )}
          aria-hidden="true">
          {selected ? "Custom amount" : "Enter your own"}
        </span>
      </div>

      {error && (
        <p
          className="mt-1.75 animate-rise-in text-xs text-danger"
          id={errorId}
          aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

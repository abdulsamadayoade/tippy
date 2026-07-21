"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type AmountInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "type" | "inputMode"
> & {
  label: ReactNode;
  value: number;
  onValueChange: (amount: number) => void;
  max?: number;
  error?: ReactNode;
  hint?: ReactNode;
  currencySymbol?: ReactNode;
  currencyCode?: ReactNode;
  visuallyHideLabel?: boolean;
  containerClassName?: string;
  controlClassName?: string;
  labelClassName?: string;
};

function formatAmount(amount: number) {
  return amount > 0 ? amount.toLocaleString("en-NG") : "";
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      id,
      label,
      value,
      onValueChange,
      max = Number.MAX_SAFE_INTEGER,
      error,
      hint,
      currencySymbol = "₦",
      currencyCode = "NGN",
      visuallyHideLabel = false,
      containerClassName,
      controlClassName,
      labelClassName,
      className,
      autoComplete = "off",
      disabled,
      required,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `amount-input-${generatedId}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const messageId = error ? errorId : hint ? hintId : undefined;
    const describedBy =
      [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;
    const invalid = Boolean(error);

    const [display, setDisplay] = useState(() => formatAmount(value));
    const lastEmitted = useRef(value);

    useEffect(() => {
      if (value !== lastEmitted.current) {
        setDisplay(formatAmount(value));
        lastEmitted.current = value;
      }
    }, [value]);

    const inputRef = useRef<HTMLInputElement>(null);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    function handleChange(raw: string) {
      const digits = raw.replace(/\D/g, "");
      const nextAmount = digits ? Math.min(Number(digits), max) : 0;
      setDisplay(digits ? nextAmount.toLocaleString("en-NG") : "");
      lastEmitted.current = nextAmount;
      onValueChange(nextAmount);
    }

    return (
      <div className={cn("w-full", containerClassName)}>
        <label
          className={cn(
            "block text-ui-sm font-medium text-copy",
            visuallyHideLabel && "sr-only",
            labelClassName,
          )}
          htmlFor={inputId}>
          {label}
        </label>

        <div
          className={cn(
            "mt-2 flex min-h-13 items-center rounded-xl bg-white px-3.5 shadow-surface transition-shadow duration-150 ease-out",
            invalid
              ? "shadow-[inset_0_0_0_1px_var(--color-danger)] focus-within:shadow-[inset_0_0_0_1px_var(--color-danger),0_0_0_4px_rgba(143,48,48,0.09),0_4px_12px_rgba(143,48,48,0.07)]"
              : "focus-within:shadow-[inset_0_0_0_1px_var(--color-primary),0_0_0_4px_rgba(6,78,91,0.12),0_4px_12px_rgba(6,78,91,0.08)]",
            disabled && "opacity-60",
            controlClassName,
          )}
          onMouseDown={(event) => {
            if (disabled || event.target === inputRef.current) return;
            event.preventDefault();
            inputRef.current?.focus();
          }}>
          {currencySymbol ? (
            <span
              className="mr-1 text-lg font-medium text-muted-text-2"
              aria-hidden="true">
              {currencySymbol}
            </span>
          ) : null}

          <input
            ref={setInputRef}
            id={inputId}
            className={cn(
              "min-w-0 flex-1 rounded-[inherit] border-0 bg-transparent py-3 text-lg font-medium tracking-display text-ink tabular-nums outline-none disabled:cursor-not-allowed",
              className,
            )}
            type="text"
            inputMode="numeric"
            autoComplete={autoComplete}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            value={display}
            onChange={(event) => handleChange(event.target.value)}
            {...props}
          />

          {currencyCode ? (
            <span className="ml-2 text-xs font-medium text-muted-text-2">
              {currencyCode}
            </span>
          ) : null}
        </div>

        {error || hint ? (
          <p
            className={cn(
              "mt-1.75 text-xs",
              error ? "text-danger" : "text-muted-text-2",
            )}
            id={messageId}
            aria-live={error ? "polite" : undefined}>
            {error ?? hint}
          </p>
        ) : null}
      </div>
    );
  },
);

AmountInput.displayName = "AmountInput";

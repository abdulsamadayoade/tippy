"use client";

import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@/components/icons/chevron-down";

export type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  placeholder?: string;
  visuallyHideLabel?: boolean;
  containerClassName?: string;
  controlClassName?: string;
  labelClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      error,
      hint,
      placeholder,
      visuallyHideLabel = false,
      containerClassName,
      controlClassName,
      labelClassName,
      className,
      value,
      disabled,
      required,
      children,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? `select-${generatedId}`;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;
    const messageId = error ? errorId : hint ? hintId : undefined;
    const describedBy =
      [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;
    const invalid = Boolean(error);
    const showingPlaceholder = value === "";

    return (
      <div className={cn("w-full", containerClassName)}>
        <label
          className={cn(
            "mb-1.5 block text-sm font-medium text-copy",
            visuallyHideLabel && "sr-only",
            labelClassName,
          )}
          htmlFor={selectId}>
          {label}
        </label>

        <div
          className={cn(
            "relative flex min-h-12 w-full items-center rounded-xl bg-white shadow-surface transition-[box-shadow,opacity] duration-150 ease-out",
            invalid
              ? "shadow-[inset_0_0_0_1px_var(--color-danger)] focus-within:shadow-[inset_0_0_0_1px_var(--color-danger),0_0_0_4px_rgba(143,48,48,0.09),0_4px_12px_rgba(143,48,48,0.07)]"
              : "focus-within:shadow-[inset_0_0_0_1px_var(--color-primary),0_0_0_4px_rgba(6,78,91,0.12),0_4px_12px_rgba(6,78,91,0.08)]",
            disabled && "opacity-60",
            controlClassName,
          )}>
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "min-h-12 min-w-0 flex-1 cursor-pointer appearance-none rounded-[inherit] border-0 bg-transparent pr-10 pl-3.5 text-sm font-medium outline-none disabled:cursor-not-allowed",
              showingPlaceholder ? "text-muted-text" : "text-body-text",
              className,
            )}
            value={value}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            {...props}>
            {placeholder !== undefined ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {children}
          </select>

          <ChevronDownIcon
            className="pointer-events-none absolute right-3.5 size-4.5 text-muted-text-2"
            aria-hidden="true"
          />
        </div>

        {error || hint ? (
          <p
            className={cn(
              "mt-1.5 animate-rise-in text-xs",
              error ? "text-danger" : "text-muted-text",
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

Select.displayName = "Select";

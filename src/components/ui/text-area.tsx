"use client";

import {
  forwardRef,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type TextAreaProps = ComponentPropsWithoutRef<"textarea"> & {
  label: ReactNode;
  labelTrailing?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  visuallyHideLabel?: boolean;
  showCount?: boolean;
  containerClassName?: string;
  controlClassName?: string;
  labelClassName?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      label,
      labelTrailing,
      error,
      hint,
      visuallyHideLabel = false,
      showCount = false,
      containerClassName,
      controlClassName,
      labelClassName,
      className,
      maxLength,
      value,
      defaultValue,
      onChange,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? `text-area-${generatedId}`;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;
    const messageId = error ? errorId : hint ? hintId : undefined;
    const describedBy =
      [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;
    const invalid =
      Boolean(error) || ariaInvalid === true || ariaInvalid === "true";

    // Track length for the counter. When controlled, derive from `value` so a
    // programmatic reset (parent clearing the value) keeps the count in sync;
    // otherwise fall back to internal state updated on change.
    const isControlled = value !== undefined;
    const [uncontrolledCount, setUncontrolledCount] = useState(
      () => String(defaultValue ?? "").length,
    );
    const count = isControlled ? String(value).length : uncontrolledCount;

    const labelElement = (
      <label
        className={cn(
          "block text-sm font-medium text-copy",
          !labelTrailing && "mb-1.5",
          visuallyHideLabel && "sr-only",
          labelClassName,
        )}
        htmlFor={textareaId}>
        {label}
      </label>
    );

    return (
      <div className={cn("w-full", containerClassName)}>
        {labelTrailing ? (
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            {labelElement}
            {labelTrailing}
          </div>
        ) : (
          labelElement
        )}

        <div className={cn("group/textarea relative", controlClassName)}>
          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              "block min-h-16.5 w-full resize-none rounded-xl border-0 bg-white px-3.5 pt-3 text-base sm:text-sm leading-[1.4] text-body-text shadow-surface outline-none transition-shadow duration-150 ease-out placeholder:text-muted-text focus:shadow-[inset_0_0_0_1px_var(--color-primary),0_0_0_4px_rgba(6,78,91,0.12),0_4px_12px_rgba(6,78,91,0.08)] disabled:cursor-not-allowed disabled:opacity-60",
              invalid &&
                "shadow-[inset_0_0_0_1px_var(--color-danger)] focus:shadow-[inset_0_0_0_1px_var(--color-danger),0_0_0_4px_rgba(143,48,48,0.09),0_4px_12px_rgba(143,48,48,0.07)]",
              showCount ? "pb-5" : "pb-3",
              className,
            )}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            onChange={(event) => {
              if (!isControlled)
                setUncontrolledCount(event.target.value.length);
              onChange?.(event);
            }}
            {...props}
          />

          {showCount ? (
            <span className="pointer-events-none absolute right-2.75 bottom-1.75 text-[10px] text-[#a4a4a4] transition-colors duration-150 ease-out group-focus-within/textarea:text-muted-text-2">
              {count}
              {maxLength ? `/${maxLength}` : null}
            </span>
          ) : null}
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

TextArea.displayName = "TextArea";

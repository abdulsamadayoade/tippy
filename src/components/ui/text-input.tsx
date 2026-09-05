"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type FieldSize = "default" | "sm";

const controlSizes: Record<FieldSize, string> = {
  default: "min-h-12",
  sm: "min-h-10",
};

const inputSizes: Record<FieldSize, string> = {
  default: "min-h-12 px-3.5",
  sm: "min-h-10 px-3",
};

export type TextInputProps = Omit<ComponentPropsWithoutRef<"input">, "size"> & {
  label: ReactNode;
  size?: FieldSize;
  error?: ReactNode;
  hint?: ReactNode;
  leadingContent?: ReactNode;
  trailingAction?: ReactNode;
  visuallyHideLabel?: boolean;
  containerClassName?: string;
  controlClassName?: string;
  labelClassName?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id,
      label,
      size = "default",
      error,
      hint,
      leadingContent,
      trailingAction,
      visuallyHideLabel = false,
      containerClassName,
      controlClassName,
      labelClassName,
      className,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `text-input-${generatedId}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const messageId = error ? errorId : hint ? hintId : undefined;
    const describedBy =
      [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;
    const invalid =
      Boolean(error) || ariaInvalid === true || ariaInvalid === "true";
    const inputRef = useRef<HTMLInputElement>(null);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;

        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    return (
      <div className={cn("w-full", containerClassName)}>
        <label
          className={cn(
            "mb-1.5 block text-sm font-medium text-copy",
            visuallyHideLabel && "sr-only",
            labelClassName,
          )}
          htmlFor={inputId}>
          {label}
        </label>

        <div
          className={cn(
            "flex w-full items-center rounded-xl bg-white shadow-surface transition-[box-shadow,opacity] duration-150 ease-out",
            controlSizes[size],
            invalid
              ? "shadow-[inset_0_0_0_1px_var(--color-danger)] focus-within:shadow-[inset_0_0_0_1px_var(--color-danger),0_0_0_4px_rgba(143,48,48,0.09),0_4px_12px_rgba(143,48,48,0.07)]"
              : "focus-within:shadow-[inset_0_0_0_1px_var(--color-primary),0_0_0_4px_rgba(6,78,91,0.12),0_4px_12px_rgba(6,78,91,0.08)]",
            disabled && "opacity-60",
            controlClassName,
          )}
          onMouseDown={(event) => {
            const target = event.target;
            const isInteractive =
              target instanceof Element &&
              target.closest(
                "button, a, input, select, textarea, [role='button']",
              );

            if (disabled || isInteractive) return;

            event.preventDefault();
            inputRef.current?.focus();
          }}>
          {leadingContent ? (
            <div
              className={cn(
                "shrink-0 cursor-text text-base font-medium text-muted-text sm:text-sm",
                size === "sm" ? "pl-3" : "pl-3.5",
              )}>
              {leadingContent}
            </div>
          ) : null}

          <input
            ref={setInputRef}
            id={inputId}
            className={cn(
              "min-w-0 flex-1 rounded-[inherit] border-0 bg-transparent text-base font-medium text-body-text outline-none placeholder:font-normal placeholder:text-muted-text disabled:cursor-not-allowed sm:text-sm",
              inputSizes[size],
              Boolean(leadingContent) && "pl-0.5",
              Boolean(trailingAction) && "pr-1.5",
              className,
            )}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            {...props}
          />

          {trailingAction ? (
            <div className="mr-1 shrink-0">{trailingAction}</div>
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

TextInput.displayName = "TextInput";

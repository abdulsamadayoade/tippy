"use client";

import { forwardRef, useCallback, useRef } from "react";
import { CalendarIcon } from "@/components/icons/calendar";
import { TextInput, type TextInputProps } from "@/components/ui/text-input";
import { cn } from "@/lib/cn";

type DatePickerProps = Omit<TextInputProps, "type" | "trailingAction"> & {
  pickerLabel?: string;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      pickerLabel = "Open date picker",
      size = "default",
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;

        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    function openPicker() {
      const input = inputRef.current;
      if (!input || disabled) return;

      input.focus();
      if (typeof input.showPicker === "function") input.showPicker();
    }

    return (
      <TextInput
        ref={setInputRef}
        {...props}
        className={cn(
          "[&::-webkit-calendar-picker-indicator]:hidden",
          className,
        )}
        type="date"
        label={label}
        size={size}
        disabled={disabled}
        trailingAction={
          <button
            className={cn(
              "inline-flex cursor-pointer items-center justify-center rounded-lg text-muted-text transition-[background-color,color] duration-150 ease-out hover:bg-soft hover:text-main-heading focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
              size === "sm" ? "size-8" : "size-10",
            )}
            type="button"
            aria-label={pickerLabel}
            disabled={disabled}
            onClick={openPicker}>
            <CalendarIcon className="size-4.5" aria-hidden="true" />
          </button>
        }
      />
    );
  },
);

DatePicker.displayName = "DatePicker";

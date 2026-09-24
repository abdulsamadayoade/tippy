import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function ClockIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8L10.5 9.5" />
    </svg>
  );
}

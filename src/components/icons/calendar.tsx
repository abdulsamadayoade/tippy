import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function CalendarIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M7.5 3.5V7.5M16.5 3.5V7.5M3.5 10H20.5" />
      <circle cx="8" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

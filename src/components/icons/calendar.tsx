import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function CalendarIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}>
      <path d="M7 3v3M17 3v3" />
      <path d="M4.5 9h15" />
      <rect x="3.5" y="5" width="17" height="16" rx="3" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
    </svg>
  );
}

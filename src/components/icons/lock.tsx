import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function LockIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M5 7V5A3 3 0 0 1 11 5V7" />
      <rect x="3" y="7" width="10" height="7" rx="2" />
      <path d="M8 10V11.5" />
    </svg>
  );
}

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function CopyIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M4 10.5H3.5A1.5 1.5 0 0 1 2 9V3.5A1.5 1.5 0 0 1 3.5 2H9A1.5 1.5 0 0 1 10.5 3.5V4" />
      <rect x="6" y="6" width="8" height="8" rx="1.75" />
    </svg>
  );
}

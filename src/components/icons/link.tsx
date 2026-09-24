import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function LinkIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M6.8 9.2C5.8 8.2 5.8 6.9 6.8 5.9L9.1 3.6C10.1 2.6 11.7 2.6 12.7 3.6S13.7 6.2 12.7 7.2L11.4 8.5M9.2 6.8C10.2 7.8 10.2 9.1 9.2 10.1L6.9 12.4C5.9 13.4 4.3 13.4 3.3 12.4S2.3 9.8 3.3 8.8L4.6 7.5" />
    </svg>
  );
}

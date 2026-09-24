import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function ExportIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M8 2.5V9.5M5 6.5L8 9.5L11 6.5M2.5 10V11.5A2 2 0 0 0 4.5 13.5H11.5A2 2 0 0 0 13.5 11.5V10" />
    </svg>
  );
}

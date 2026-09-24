import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function ArrowRightIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M2.5 8H13.5M10 4.5L13.5 8L10 11.5" />
    </svg>
  );
}

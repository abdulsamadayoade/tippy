import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function ArrowLeftIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M20 12H4M9 7L4 12L9 17" />
    </svg>
  );
}

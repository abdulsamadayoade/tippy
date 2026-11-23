import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function PaySuccessIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("text-brand-ink", className)}
      {...props}>
      <g className="fill-brand-tint" stroke="none">
        <circle cx="12" cy="12" r="8.5" />
      </g>
      <circle cx="12" cy="12" r="8.5" />
      <path pathLength={20} d="M8 12L10.7 14.7L16 9.5" />
    </svg>
  );
}

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function UserIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <circle cx="8" cy="5" r="2.5" />
      <path d="M3 13.5C3 10.7 5.2 9.5 8 9.5S13 10.7 13 13.5" />
    </svg>
  );
}

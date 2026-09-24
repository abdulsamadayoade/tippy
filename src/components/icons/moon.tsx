import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function MoonIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M7 2C4.1 2.5 2 5 2 8C2 11.3 4.7 14 8 14C11 14 13.5 11.9 14 9C13.3 9.3 12.6 9.5 11.8 9.5C8.9 9.5 6.5 7.1 6.5 4.2C6.5 3.4 6.7 2.7 7 2Z" />
    </svg>
  );
}

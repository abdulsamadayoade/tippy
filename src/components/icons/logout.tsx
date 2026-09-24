import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function LogoutIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M7 2.5H4.5A2 2 0 0 0 2.5 4.5V11.5A2 2 0 0 0 4.5 13.5H7M6.5 8H14M11 5L14 8L11 11" />
    </svg>
  );
}

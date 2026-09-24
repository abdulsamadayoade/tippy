import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function SettingsIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M2.5 5H4M7.5 5H13.5M2.5 11H8.5M12 11H13.5" />
      <circle cx="5.75" cy="5" r="1.75" />
      <circle cx="10.25" cy="11" r="1.75" />
    </svg>
  );
}

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function ClockIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      color="currentColor"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      {...props}
      className={cn(className)}>
      <circle cx="12" cy="12" r="10"></circle>
      <path
        d="M12 8V12L14 14"
        strokeLinecap="round"
        strokeLinejoin="round"></path>
    </svg>
  );
}

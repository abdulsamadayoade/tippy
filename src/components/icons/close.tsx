import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function CloseIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}>
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

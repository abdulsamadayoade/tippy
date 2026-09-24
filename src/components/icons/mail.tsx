import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function MailIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 6.5L10.4 11.8C11.3 12.5 12.7 12.5 13.6 11.8L20 6.5" />
    </svg>
  );
}

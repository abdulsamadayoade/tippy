import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function EditIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M2.5 13.5L3.3 10.2L10.8 2.7C11.5 2 12.5 2 13.2 2.7S13.9 4.4 13.2 5.1L5.7 12.6ZM9.5 4L11.9 6.4" />
    </svg>
  );
}

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function CameraIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M5.5 4L6.5 2.5H9.5L10.5 4H12C13.1 4 14 4.9 14 6V11.5C14 12.6 13.1 13.5 12 13.5H4C2.9 13.5 2 12.6 2 11.5V6C2 4.9 2.9 4 4 4H5.5Z" />
      <circle cx="8" cy="8.5" r="2.5" />
    </svg>
  );
}

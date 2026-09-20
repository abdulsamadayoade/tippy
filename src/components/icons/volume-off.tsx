import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function VolumeOffIcon({ className, ...props }: ComponentProps<"svg">) {
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
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}>
      <path d="M3 9.5H6.5L11 5.5V18.5L6.5 14.5H3V9.5Z"></path>
      <path d="M15.5 9.5L20.5 14.5M20.5 9.5L15.5 14.5"></path>
    </svg>
  );
}

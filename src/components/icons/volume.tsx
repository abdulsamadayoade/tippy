import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function VolumeIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M2 6H4.5L7.5 3.5V12.5L4.5 10H2V6Z" />
      <path d="M10 6C11 7.1 11 8.9 10 10M12 4C14.1 6.2 14.1 9.8 12 12" />
    </svg>
  );
}

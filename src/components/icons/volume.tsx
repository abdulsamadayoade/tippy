import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function VolumeIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M14.75 9.5C16.08 10.9 16.08 13.1 14.75 14.5"></path>
      <path d="M17.5 7C20.17 9.8 20.17 14.2 17.5 17"></path>
    </svg>
  );
}

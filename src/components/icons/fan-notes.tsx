import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function FanNotesIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("text-[#064e5b] dark:text-[#bce9e8]", className)}
      {...props}>
      <g className="fill-[#d6f1ef] dark:fill-[#17454d]" stroke="none">
        <path d="M6.5 4.5H17.5A3 3 0 0 1 20.5 7.5V14A3 3 0 0 1 17.5 17H11L6.8 20.3V17H6.5A3 3 0 0 1 3.5 14V7.5A3 3 0 0 1 6.5 4.5Z" />
      </g>
      <path d="M6.5 4.5H17.5A3 3 0 0 1 20.5 7.5V14A3 3 0 0 1 17.5 17H11L6.8 20.3V17H6.5A3 3 0 0 1 3.5 14V7.5A3 3 0 0 1 6.5 4.5Z" />
      <path d="M7.7 9H16.3M7.7 12.8H12.5" />
    </svg>
  );
}

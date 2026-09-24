import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function AutomaticPayoutsIcon({
  className,
  ...props
}: ComponentProps<"svg">) {
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
        <path d="M3.5 10H20.5V17.5A3 3 0 0 1 17.5 20.5H6.5A3 3 0 0 1 3.5 17.5Z" />
      </g>
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M7.5 3.5V7.5M16.5 3.5V7.5M3.5 10H20.5" />
      <path d="M8 15H16.2M13.4 12.2L16.2 15L13.4 17.8" />
    </svg>
  );
}

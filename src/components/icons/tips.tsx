import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function TipsIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
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
        <path d="M12 8.6C10.6 7.6 8.7 6.2 8.7 4.7C8.7 3.1 10.7 2.4 12 4C13.3 2.4 15.3 3.1 15.3 4.7C15.3 6.2 13.4 7.6 12 8.6Z" />
      </g>
      <path d="M12 8.6C10.6 7.6 8.7 6.2 8.7 4.7C8.7 3.1 10.7 2.4 12 4C13.3 2.4 15.3 3.1 15.3 4.7C15.3 6.2 13.4 7.6 12 8.6Z" />
      <path d="M3 15.6L6 13.3Q7.6 12.1 9.3 12.6L13.6 13.4Q15.5 13.6 15.3 15.3L18.4 12.2C20 10.7 22 12.6 20.4 14.2L15.9 18.8Q14.7 20 12.6 20H9.5Q8.4 20 7.2 19.6L3 18.5Z" />
      <path d="M15.3 15.3Q15.2 16.4 13.7 16.4H10.8" />
    </svg>
  );
}

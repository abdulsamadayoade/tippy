import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function PersonalLinkIcon({
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
        <path d="M10 13.7C8.6 12.3 8.6 10.1 10 8.7L13.6 5.1C15.1 3.6 17.5 3.6 19 5.1C20.5 6.6 20.5 9 19 10.5L16.9 12.6Z" />
        <path d="M14 10.3C15.4 11.7 15.4 13.9 14 15.3L10.4 18.9C8.9 20.4 6.5 20.4 5 18.9C3.5 17.4 3.5 15 5 13.5L7.1 11.4Z" />
      </g>
      <path d="M10 13.7C8.6 12.3 8.6 10.1 10 8.7L13.6 5.1C15.1 3.6 17.5 3.6 19 5.1C20.5 6.6 20.5 9 19 10.5L16.9 12.6" />
      <path d="M14 10.3C15.4 11.7 15.4 13.9 14 15.3L10.4 18.9C8.9 20.4 6.5 20.4 5 18.9C3.5 17.4 3.5 15 5 13.5L7.1 11.4" />
    </svg>
  );
}

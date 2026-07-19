import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function ArrowRightIcon({
  className,
  ...props
}: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}>
      <path d="M13 6L19 12L13 18" />
      <path d="M5 12H19" />
    </svg>
  );
}

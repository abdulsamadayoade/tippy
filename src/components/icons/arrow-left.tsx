import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function ArrowLeftIcon({
  className,
  ...props
}: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="32"
      height="32"
      color="currentColor"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}>
      <path d="M11 6L5 12L11 18" />
      <path d="M5 12H19" />
    </svg>
  );
}

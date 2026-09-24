import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function BankBuildingIcon({
  className,
  ...props
}: ComponentProps<"svg">) {
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
      <path d="M2 5.5L8 2L14 5.5ZM4.5 8V11.5M8 8V11.5M11.5 8V11.5M2.5 14H13.5" />
    </svg>
  );
}

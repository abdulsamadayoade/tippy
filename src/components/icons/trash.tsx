import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function TrashIcon({
  className,
  size = 16,
  ...props
}: ComponentProps<"svg"> & { size?: 16 | 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={size === 16 ? 1.5 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}>
      <path
        d={
          size === 16
            ? "M2.5 4.5H13.5M6 4.5V3C6 2.4 6.4 2 7 2H9C9.6 2 10 2.4 10 3V4.5M4 4.5L4.6 12.6C4.7 13.4 5.3 14 6.1 14H9.9C10.7 14 11.3 13.4 11.4 12.6L12 4.5M6.5 7V11M9.5 7V11"
            : "M4 6.5H20M9 6.5V4.5C9 3.7 9.7 3 10.5 3H13.5C14.3 3 15 3.7 15 4.5V6.5M6 6.5L6.8 18.6C6.9 20 7.8 21 9.2 21H14.8C16.2 21 17.1 20 17.2 18.6L18 6.5M10 10V17M14 10V17"
        }
      />
    </svg>
  );
}

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function CloseIcon({
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
      <path d={size === 16 ? "M4 4L12 12M12 4L4 12" : "M6 6L18 18M18 6L6 18"} />
    </svg>
  );
}

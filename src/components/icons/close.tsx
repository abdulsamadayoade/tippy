import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function CloseIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="32"
      height="32"
      color="currentColor"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}>
      <path d="M18 6L12 12M12 12L6 18M12 12L18 18M12 12L6 6"></path>
    </svg>
  );
}

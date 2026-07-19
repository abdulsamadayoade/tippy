import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function LogoutIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M9 4H5.5C4.67157 4 4 4.67157 4 5.5V18.5C4 19.3284 4.67157 20 5.5 20H9" />
      <path d="M15.5 8L19.5 12L15.5 16" />
      <path d="M19.5 12H9" />
    </svg>
  );
}

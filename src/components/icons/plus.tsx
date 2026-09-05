import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function PlusIcon({ className, ...props }: ComponentProps<"svg">) {
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
      {...props}
      className={cn(className)}>
      <path d="M12.001 5.00003V19.002"></path>
      <path d="M19.002 12.002L4.99998 12.002"></path>
    </svg>
  );
}

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function MailIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M2.5 7C2.5 5.89543 3.39543 5 4.5 5H19.5C20.6046 5 21.5 5.89543 21.5 7V17C21.5 18.1046 20.6046 19 19.5 19H4.5C3.39543 19 2.5 18.1046 2.5 17V7Z" />
      <path d="M3.5 7L10.594 12.3162C11.4275 12.9411 12.5725 12.9411 13.406 12.3162L20.5 7" />
    </svg>
  );
}

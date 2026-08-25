import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function CameraIcon({ className, ...props }: ComponentProps<"svg">) {
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
      <path d="M4 9.5C4 8.11929 5.11929 7 6.5 7H7.38197C7.76074 7 8.107 6.786 8.27639 6.44721L8.72361 5.55279C8.893 5.214 9.23926 5 9.61803 5H14.382C14.7607 5 15.107 5.214 15.2764 5.55279L15.7236 6.44721C15.893 6.786 16.2393 7 16.618 7H17.5C18.8807 7 20 8.11929 20 9.5V16.5C20 17.8807 18.8807 19 17.5 19H6.5C5.11929 19 4 17.8807 4 16.5V9.5Z"></path>
      <circle cx="12" cy="12.5" r="3"></circle>
    </svg>
  );
}

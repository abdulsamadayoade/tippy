import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function PayoutsIcon({
  className,
  variant = "micro",
  ...props
}: ComponentProps<"svg"> & { variant?: "micro" | "duotone" }) {
  const isDuotone = variant === "duotone";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={isDuotone ? 48 : 16}
      height={isDuotone ? 48 : 16}
      viewBox={isDuotone ? "0 0 24 24" : "0 0 16 16"}
      fill="none"
      stroke="currentColor"
      strokeWidth={isDuotone ? 1.8 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(
        isDuotone && "text-[#064e5b] dark:text-[#bce9e8]",
        className,
      )}
      {...props}>
      {isDuotone ? (
        <>
          <g className="fill-[#d6f1ef] dark:fill-[#17454d]" stroke="none">
            <path d="M3.5 14H20.5V17.3Q20.5 20.5 17.3 20.5H6.7Q3.5 20.5 3.5 17.3Z" />
          </g>
          <path d="M3.5 14H20.5V17.3Q20.5 20.5 17.3 20.5H6.7Q3.5 20.5 3.5 17.3Z" />
          <path d="M3.5 14L5.8 10.3H8M16 10.3H18.2L20.5 14M12 12V3.5M8 7.5L12 3.5L16 7.5" />
        </>
      ) : (
        <path d="M2.5 9.5V11.5A2 2 0 0 0 4.5 13.5H11.5A2 2 0 0 0 13.5 11.5V9.5M8 9V2.5M5 5.5L8 2.5L11 5.5" />
      )}
    </svg>
  );
}

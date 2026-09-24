import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type DropdownProps = ComponentProps<"div"> & {
  state: "closed" | "open" | "closing";
  origin?: "top-left" | "top-right";
};

export function Dropdown({
  state,
  origin = "top-left",
  className,
  ...props
}: DropdownProps) {
  return (
    <div
      {...props}
      role="menu"
      data-state={state}
      data-origin={origin}
      inert={state === "closed"}
      className={cn(
        "pointer-events-none origin-top-left scale-[0.97] opacity-0 transition-[scale,opacity] duration-250 ease-(--ease-smooth) will-change-[scale,opacity] data-[origin=top-right]:origin-top-right data-[state=open]:pointer-events-auto data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=closing]:scale-[0.99] data-[state=closing]:duration-(--dropdown-close-dur) motion-reduce:transition-none",
        className,
      )}
    />
  );
}

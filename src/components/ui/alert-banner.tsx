import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const variants = {
  default: "bg-soft text-body-text",
  danger: "bg-danger-soft text-danger",
} as const;

type AlertBannerProps = ComponentPropsWithoutRef<"div"> & {
  variant?: keyof typeof variants;
};

export function AlertBanner({
  variant = "default",
  className,
  role = "status",
  ...props
}: AlertBannerProps) {
  return (
    <div
      className={cn(
        "rounded-md px-4 py-2 text-sm leading-normal",
        variants[variant],
        className,
      )}
      role={role}
      {...props}
    />
  );
}

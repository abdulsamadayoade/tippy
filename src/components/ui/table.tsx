import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type TableProps = ComponentPropsWithoutRef<"table"> & {
  containerClassName?: string;
};

export function Table({
  containerClassName,
  className,
  ...props
}: TableProps) {
  return (
    <div className={cn("w-full overflow-x-auto", containerClassName)}>
      <table
        className={cn("w-full text-left text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"thead">) {
  return (
    <thead className={cn("text-xs text-muted-text", className)} {...props} />
  );
}

export function TableBody({
  className,
  ...props
}: ComponentPropsWithoutRef<"tbody">) {
  return (
    <tbody className={cn("divide-y divide-line", className)} {...props} />
  );
}

export function TableRow({
  className,
  ...props
}: ComponentPropsWithoutRef<"tr">) {
  return <tr className={cn("align-top", className)} {...props} />;
}

export function TableHead({
  className,
  scope = "col",
  ...props
}: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={cn("px-4 py-2 font-medium whitespace-nowrap", className)}
      scope={scope}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"td">) {
  return <td className={cn("px-4 py-3", className)} {...props} />;
}

export function TableCaption({
  className,
  ...props
}: ComponentPropsWithoutRef<"caption">) {
  return (
    <caption
      className={cn("mt-3 text-sm text-muted-text", className)}
      {...props}
    />
  );
}

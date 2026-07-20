import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn("skeleton block rounded-md", className)}
      aria-hidden="true"
    />
  );
}

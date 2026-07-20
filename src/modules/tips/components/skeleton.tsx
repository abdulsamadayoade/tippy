import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/skeleton";

export function TipsSkeleton() {
  return (
    <section role="status" aria-label="Loading tips">
      <Skeleton className="mt-1 h-5 w-14" />
      <Skeleton className="mt-2.5 h-3.5 w-72 max-w-full" />

      <div className="mt-5 grid grid-cols-3 gap-3 max-dashboard:grid-cols-2 max-phone-sm:grid-cols-1">
        {[0, 1, 2].map((index) => (
          <article
            key={index}
            className={cn(
              "rounded-[14px] bg-white p-4.5 shadow-surface",
              index === 0 && "max-dashboard:col-span-2 max-phone-sm:col-span-1",
            )}>
            <Skeleton className="h-4 w-24 max-w-full" />
            <Skeleton className="mt-2.5 h-8 w-28 max-w-full" />
          </article>
        ))}
      </div>

      <Skeleton className="mt-5 h-9 w-64 max-w-full rounded-full" />

      <div className="mt-3.5 flex flex-col rounded-[14px] bg-white p-1 shadow-surface">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-16 items-start gap-3 px-3.5 py-3 max-phone:px-2.5">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-28 max-w-full" />
              <Skeleton className="mt-1.5 h-3.5 w-56 max-w-full" />
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-1.5 h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading tips…</span>
    </section>
  );
}

import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/skeleton";

function BannerBlock({ className }: { className?: string }) {
  return (
    <span
      className={cn("block animate-pulse rounded-md bg-white/15", className)}
      aria-hidden="true"
    />
  );
}

export function PayoutsSkeleton() {
  return (
    <section role="status" aria-label="Loading payouts">
      <Skeleton className="mt-1 h-5 w-24" />
      <Skeleton className="mt-2.5 h-3.5 w-64 max-w-full" />

      <article className="creator-banner-grid mt-5 flex flex-wrap items-end justify-between gap-4 rounded-[18px] bg-primary p-6 max-phone:p-5">
        <div>
          <BannerBlock className="h-4 w-32" />
          <BannerBlock className="mt-2.5 h-8 w-36" />
          <BannerBlock className="mt-2.5 h-4 w-44" />
        </div>
        <BannerBlock className="h-9.5 w-36 rounded-full" />
      </article>

      <article className="mt-4 rounded-surface bg-white shadow-surface">
        <div className="flex items-center justify-between gap-3 px-4.5 py-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-28 max-w-full" />
            <Skeleton className="mt-1.5 h-5 w-56 max-w-full" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-4.5 py-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-32 max-w-full" />
            <Skeleton className="mt-1.5 h-5 w-44 max-w-full" />
          </div>
          <Skeleton className="h-6 w-12 shrink-0 rounded-full" />
        </div>
      </article>

      <div className="mt-7">
        <Skeleton className="h-5 w-28" />
        <div className="mt-3 flex flex-col rounded-surface bg-white p-1 shadow-surface">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto_minmax(82px,auto)] items-center gap-3 rounded-[10px] p-3.5",
                "max-phone:grid-cols-[minmax(0,1fr)_auto]",
              )}>
              <div>
                <Skeleton className="h-4 w-28 max-w-full" />
                <Skeleton className="mt-1.5 h-3 w-40 max-w-full" />
              </div>
              <Skeleton className="h-5.5 w-16 rounded-full max-phone:col-start-1 max-phone:row-start-2 max-phone:justify-self-start" />
              <Skeleton className="h-5 w-20 justify-self-end max-phone:col-start-2 max-phone:row-span-2 max-phone:row-start-1" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading payouts…</span>
    </section>
  );
}

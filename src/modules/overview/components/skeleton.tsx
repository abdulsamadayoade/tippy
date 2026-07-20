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

export function OverviewSkeleton() {
  return (
    <section role="status" aria-label="Loading overview">
      <Skeleton className="h-3.5 w-44 max-w-full" />
      <Skeleton className="mt-2.5 h-5 w-72 max-w-full" />

      <div className="mt-5.5 grid grid-cols-3 gap-3 max-dashboard:grid-cols-2 max-phone-sm:grid-cols-1">
        <article className="creator-banner-grid col-span-full flex flex-wrap items-end justify-between gap-4 rounded-[18px] bg-primary p-6 max-phone:p-5">
          <div>
            <BannerBlock className="h-4 w-24" />
            <BannerBlock className="mt-2.5 h-8 w-36" />
            <BannerBlock className="mt-3 h-6 w-28 rounded-full" />
          </div>
          <div className="text-right max-phone:flex max-phone:w-full max-phone:items-center max-phone:justify-between max-phone:border-t max-phone:border-white/12 max-phone:pt-3.5">
            <div>
              <BannerBlock className="ml-auto h-4 w-20 max-phone:ml-0" />
              <BannerBlock className="mt-0.75 ml-auto h-5 w-24 max-phone:mt-0 max-phone:ml-0" />
            </div>
            <BannerBlock className="mt-2 ml-auto h-4 w-16 max-phone:mt-0 max-phone:ml-0" />
          </div>
        </article>

        {[0, 1, 2].map((index) => (
          <article
            key={index}
            className={cn(
              "rounded-[14px] bg-white p-4.5 shadow-surface",
              index === 2 && "max-dashboard:col-span-2 max-phone-sm:col-span-1",
            )}>
            <Skeleton className="h-4 w-24 max-w-full" />
            <Skeleton className="mt-2.5 h-8 w-28 max-w-full" />
          </article>
        ))}
      </div>

      <article className="mt-3 flex flex-wrap items-center justify-between gap-3.5 rounded-[14px] bg-white px-4.5 py-4 shadow-surface">
        <div>
          <Skeleton className="h-4.5 w-32 max-w-full" />
          <Skeleton className="mt-0.75 h-6 w-44 max-w-full" />
        </div>
        <Skeleton className="h-7 w-26 rounded-full" />
      </article>

      <div className="mt-7">
        <Skeleton className="h-6 w-24" />
        <div className="mt-3 flex flex-col rounded-[14px] bg-white p-1 shadow-surface">
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
      </div>

      <span className="sr-only">Loading overview…</span>
    </section>
  );
}

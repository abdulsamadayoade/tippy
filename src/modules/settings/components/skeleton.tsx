import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <section role="status" aria-label="Loading settings">
      <Skeleton className="mt-1 h-5 w-24" />
      <Skeleton className="mt-2.5 h-3.5 w-64 max-w-full" />

      <article className="mt-5 rounded-surface bg-white p-4.5 shadow-surface">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="mt-2 h-3.5 w-52 max-w-full" />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3.5">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="mt-1 h-12 w-36 rounded-full" />
        </div>
      </article>

      <div className="mt-7">
        <Skeleton className="h-5 w-28" />
        <article className="mt-3 rounded-surface bg-white shadow-surface">
          <div className="flex flex-col gap-4 p-4.5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <Skeleton className="h-3.5 w-20" />
                <div className="mt-1.5 grid grid-cols-2 gap-2.5 max-phone:grid-cols-1">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            ))}
            <Skeleton className="h-12 w-36 rounded-full" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-4.5 py-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-28 max-w-full" />
              <Skeleton className="mt-1.5 h-5 w-52 max-w-full" />
            </div>
            <Skeleton className="h-6 w-12 shrink-0 rounded-full" />
          </div>
        </article>
      </div>

      <span className="sr-only">Loading settings…</span>
    </section>
  );
}

import { CreatorAvatar } from "@/components/ui/creator-avatar";
import { sampleCreator } from "@/data";
import { sampleNotes } from "../data";

export function ProductPreview() {
  return (
    <div className="relative mt-14 w-full min-w-0 max-w-2xl text-left">
      <article
        className="relative w-full min-w-0 max-w-full shadow-xs overflow-hidden rounded-3xl bg-white p-3"
        aria-label="Preview of the Tippy creator dashboard">
        <header className="flex items-center justify-between gap-3 px-2 py-1.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <CreatorAvatar
              size="small"
              name={sampleCreator.name}
              photoUrl={sampleCreator.profilePhotoUrl}
            />
            <div className="min-w-0">
              <strong className="block truncate text-sm font-medium text-main-heading">
                {sampleCreator.name}
              </strong>
              <span className="block truncate text-xs text-muted-text">
                {sampleCreator.tipUrl}
              </span>
            </div>
          </div>
        </header>

        <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-2 max-[560px]:grid-cols-1">
          <section className="creator-banner-grid flex min-w-0 flex-col justify-between rounded-[18px] bg-primary p-5 text-white max-[460px]:min-h-51 max-[460px]:p-4.5 min-[461px]:min-h-56">
            <div>
              <p className="text-xs font-medium tracking-[0.04em] text-white/80 uppercase">
                Tips this week
              </p>
              <strong className="mt-2 block text-3xl leading-none font-medium tracking-[-0.035em]">
                ₦48,500
              </strong>
            </div>

            <div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full w-[72%] bg-white rounded-full" />
              </div>
              <div className="flex items-end justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-2.5 py-1 text-xs font-medium">
                  <span className="size-1.5 rounded-full" aria-hidden="true" />+
                  ₦5,000 just now
                </span>
                <span className="text-xs text-white/80">12 supporters</span>
              </div>
            </div>
          </section>

          <section className="min-w-0 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Notes from supporters</h2>
              <span className="text-xs">Today</span>
            </div>

            <div className="mt-3 space-y-2">
              {sampleNotes.map((supporter) => (
                <article
                  className="rounded-xl bg-white/88 p-3 shadow-xs border border-gray-100 backdrop-blur-sm"
                  key={supporter.name}>
                  <div className="flex items-center gap-2">
                    <div className="size-6 flex items-center justify-center text-white bg-main-heading rounded-full text-xs font-semibold">
                      {supporter.initial}
                    </div>
                    <strong className="min-w-0 flex-1 truncate text-xs font-medium text-main-heading">
                      {supporter.name}
                    </strong>
                    <span className="text-xs font-medium">
                      {supporter.amount}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-body-text">
                    “{supporter.note}”
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

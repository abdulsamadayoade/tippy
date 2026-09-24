import { features } from "../data";

export function Features() {
  return (
    <div className="mt-10 grid w-full min-w-0 max-w-2xl grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
      {features.map(({ icon: Icon, title, body }) => (
        <div
          className="min-w-0 rounded-2xl bg-card-bg p-5 shadow-surface"
          key={title}>
          <div
            className="flex size-10 bg-pill-bg border border-gray-200 dark:border-pill-active-bg items-center justify-center rounded-full"
            aria-hidden="true">
            <Icon className="size-4.5 stroke-1" />
          </div>
          <h2 className="mt-3.5 text-sm font-medium text-main-heading">
            {title}
          </h2>
          <p className="mt-1 text-ui-sm leading-normal tracking-normal text-muted-text">
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}

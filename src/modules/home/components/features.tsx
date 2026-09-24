import { features } from "../data";

export function Features() {
  return (
    <div className="mt-10 grid w-full min-w-0 max-w-2xl grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
      {features.map(({ icon: Icon, title, body }) => (
        <div
          className="min-w-0 rounded-2xl bg-card-bg p-5 shadow-surface"
          key={title}>
          <Icon className="size-10" aria-hidden="true" />
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

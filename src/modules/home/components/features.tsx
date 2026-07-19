import { features } from "../data";

export function Features() {
  return (
    <div className="mt-10 grid w-full min-w-0 max-w-2xl grid-cols-3 gap-4 text-left max-[600px]:grid-cols-1">
      {features.map(({ icon: Icon, title, body }) => (
        <div
          className="min-w-0 rounded-2xl bg-white p-5 shadow-surface"
          key={title}>
          <div
            className="flex size-10 bg-gray-100 border border-gray-200 items-center justify-center rounded-full"
            aria-hidden="true">
            <Icon className="size-4.5 stroke-1" />
          </div>
          <h2 className="mt-3.5 text-sm font-medium text-main-heading">
            {title}
          </h2>
          <p className="mt-1 text-[13px] tracking-[0.005px] leading-normal text-muted-text">
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}

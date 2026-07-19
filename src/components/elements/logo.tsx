import { TipIcon } from "../icons/tip";

export function Logo() {
  return (
    <div className="flex items-center gap-1">
      <TipIcon className="size-5" />
      <span
        className="inline-flex text-lg leading-none font-medium tracking-[-0.02em] text-ink"
        aria-label="Tippy">
        tippy
        <span className="text-brand-500" aria-hidden="true">
          .
        </span>
      </span>
    </div>
  );
}

import { TipIcon } from "../icons/tip";

export function Logo() {
  return (
    <div className="flex items-center gap-1 text-logo">
      <TipIcon className="size-5" />
      <span
        className="inline-flex text-lg leading-none font-medium tracking-display text-current"
        aria-label="Tippy">
        tippy
      </span>
    </div>
  );
}

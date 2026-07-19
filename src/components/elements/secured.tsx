import { LockIcon } from "../icons/lock";
import { MonnifyLogo } from "./monnify-logo";

export function Secured({ text = "Payments secured by" }: { text?: string }) {
  return (
    <p className="mt-2.5 flex items-center justify-center gap-1 text-xs text-muted-text">
      <LockIcon className="size-4 stroke-2" aria-hidden="true" />
      <span>{text}</span>
      <MonnifyLogo className="h-3 w-auto text-main-heading" />
    </p>
  );
}

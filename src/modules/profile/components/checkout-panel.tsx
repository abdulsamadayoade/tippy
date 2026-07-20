import { CreatorAvatar } from "@/components/ui/creator-avatar";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/elements/error-message";
import { LockIcon } from "@/components/icons/lock";
import { CloseIcon } from "@/components/icons/close";
import { MonnifyLogo } from "@/components/elements/monnify-logo";
import { formatNaira } from "@/lib/utils";
import { CheckoutPanelProps } from "../types";

export function CheckoutPanel({
  creatorName,
  creatorPhotoUrl,
  amount,
  message,
  paying,
  error,
  onSubmit,
  onClose,
  closeRef,
}: CheckoutPanelProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <CreatorAvatar
          size="medium"
          name={creatorName}
          photoUrl={creatorPhotoUrl}
        />
        <div className="flex-1">
          <span className="text-xs text-muted-text-2">Sending a tip to</span>
          <h2
            className="text-base font-medium text-main-heading"
            id="checkout-title">
            {creatorName}
          </h2>
        </div>
        <button
          ref={closeRef}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-soft disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          aria-label="Close checkout"
          disabled={paying}
          onClick={onClose}>
          <CloseIcon className="size-5" />
        </button>
      </div>

      <div className="px-0 pt-6 pb-2 text-center">
        <span className="block text-xs font-medium tracking-[0.006em] text-muted-text-2 uppercase">
          You&apos;re sending
        </span>
        <strong className="mt-1.5 block text-2xl font-medium tracking-[-0.02em] text-main-heading">
          {formatNaira(amount)}
        </strong>
      </div>

      {message.trim() && (
        <blockquote className="mt-2 rounded-xl bg-soft px-3.5 py-2.75 text-sm">
          “{message.trim()}”
        </blockquote>
      )}

      <div className="mt-4.5 mb-3.5 flex items-center justify-center gap-2 text-center text-xs text-muted-text-2">
        <div className="flex items-center gap-1">
          <LockIcon className="size-4 stroke-2" />
          <MonnifyLogo className="h-3 w-auto shrink-0 text-primary" />
        </div>
        <span>securely processes your payment</span>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Button
        className="w-full"
        loading={paying}
        loadingText="Confirming your tip…"
        onClick={onSubmit}>
        Send {formatNaira(amount)} securely
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="mx-auto mt-2 block"
        disabled={paying}
        onClick={onClose}>
        Go back
      </Button>
    </>
  );
}

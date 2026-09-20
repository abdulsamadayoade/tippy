"use client";

import { useState, type SubmitEvent } from "react";
import { verifyPayoutIdentity } from "../actions";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import type { IdentityCardProps } from "../types";

export function IdentityCard({
  identityVerified,
  environment,
}: IdentityCardProps) {
  const [bvn, setBvn] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(identityVerified);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await verifyPayoutIdentity({ bvn, consent });
      if (result.verified) {
        setVerified(true);
        setBvn("");
      } else
        setError(
          result.error ?? "We couldn't verify your identity. Please try again.",
        );
    } catch {
      setError("We couldn't complete verification. Please try again shortly.");
    } finally {
      setPending(false);
    }
  }

  return (
    <article
      className="mt-4 rounded-surface bg-white px-4.5 py-5 shadow-surface"
      aria-labelledby="identity-heading">
      <h2
        id="identity-heading"
        className="text-sm font-medium text-main-heading">
        Verify your identity
      </h2>
      {verified ? (
        <p
          className="mt-2 text-sm text-success dark:text-main-heading"
          role="status">
          {environment === "sandbox"
            ? "Identity verified for sandbox testing only."
            : "Your identity matches this bank account."}
        </p>
      ) : (
        <>
          <p className="mt-1 text-ui-sm leading-normal text-muted-text">
            Verify your BVN before withdrawing. The BVN must match your payout
            bank account. Tippy covers the verification cost.
          </p>
          <form className="mt-4 flex max-w-md flex-col gap-3" onSubmit={submit}>
            <TextInput
              label={environment === "sandbox" ? "Test BVN" : "BVN"}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]{11}"
              maxLength={11}
              required
              disabled={pending}
              value={bvn}
              onChange={(event) => {
                setBvn(event.target.value.replace(/\D/g, "").slice(0, 11));
                setError("");
              }}
              hint="We use your BVN only for this check and do not store the number."
            />
            <label className="flex cursor-pointer items-start gap-2.5 text-ui-sm leading-normal text-body-text">
              <input
                className="mt-0.5 size-4 shrink-0 accent-primary"
                type="checkbox"
                required
                checked={consent}
                disabled={pending}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                I consent to Tippy sharing my BVN and bank details with Monnify
                to verify my identity.
              </span>
            </label>
            {error && (
              <p role="alert" className="text-xs text-danger">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="sm"
              className="self-start active:scale-[0.96]"
              loading={pending}
              loadingText="Verifying…"
              disabled={!consent || bvn.length !== 11}>
              Verify identity
            </Button>
          </form>
        </>
      )}
    </article>
  );
}

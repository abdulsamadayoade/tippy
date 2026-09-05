"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/utils";
import { createAdjustment, lookupAdjustmentReferenceAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";
import { ErrorMessage } from "@/components/elements/error-message";
import { CheckIcon } from "@/components/icons/check";
import { PlusIcon } from "@/components/icons/plus";
import { TYPE_OPTIONS } from "../data";
import type { CreatorOption, AdjustmentType } from "../types";

export function AdjustmentModal({ creators }: { creators: CreatorOption[] }) {
  const router = useRouter();
  const creatorRef = useRef<HTMLSelectElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [creatorId, setCreatorId] = useState("");
  const [type, setType] = useState<AdjustmentType>("refund");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [relatedReference, setRelatedReference] = useState("");
  const [allowNegative, setAllowNegative] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const [relatedTip, setRelatedTip] = useState<{
    gross: number;
    fee: number;
    net: number;
  } | null>(null);

  const amountNumber = Number(amount);
  const creatorError =
    submitAttempted && !creatorId ? "Pick a creator." : undefined;
  const amountError =
    submitAttempted && (!Number.isInteger(amountNumber) || amountNumber <= 0)
      ? "Enter a whole naira amount greater than zero."
      : undefined;
  const reasonError =
    submitAttempted && reason.trim().length < 10
      ? "Explain the adjustment in at least 10 characters."
      : undefined;

  useEffect(() => {
    if (!open || !saved) return;
    const frame = window.requestAnimationFrame(() => doneRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, saved]);

  function openModal() {
    setCreatorId("");
    setType("refund");
    setAmount("");
    setReason("");
    setRelatedReference("");
    setAllowNegative(false);
    setSubmitAttempted(false);
    setServerError("");
    setSaved(false);
    setRelatedTip(null);
    setOpen(true);
  }

  function closeModal() {
    if (!busy) setOpen(false);
  }

  async function resolveReference() {
    const reference = relatedReference.trim();
    if (!reference) {
      setRelatedTip(null);
      return;
    }

    const result = await lookupAdjustmentReferenceAction(reference);
    if (result.error) {
      setRelatedTip(null);
      setServerError(result.error);
      return;
    }
    if (!result.tip) {
      setRelatedTip(null);
      return;
    }

    setRelatedTip(result.tip);
    if (!creatorId) setCreatorId(result.tip.creatorId);
    if (!amount) setAmount(String(result.tip.net));
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setServerError("");

    if (
      !creatorId ||
      !Number.isInteger(amountNumber) ||
      amountNumber <= 0 ||
      reason.trim().length < 10
    ) {
      return;
    }

    setBusy(true);
    const result = await createAdjustment({
      creatorId,
      type,
      amount: amountNumber,
      reason,
      relatedReference: relatedReference.trim() || undefined,
      allowNegative,
    });
    setBusy(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <>
      <Button onClick={openModal} size="sm">
        <PlusIcon className="size-4.5" aria-hidden="true" />
        Record adjustment
      </Button>

      <Modal
        open={open}
        onClose={closeModal}
        labelledBy="adjustment-dialog-title"
        describedBy="adjustment-dialog-description"
        dismissible={!busy}
        initialFocusRef={saved ? doneRef : creatorRef}
        className="max-h-[calc(100vh-2rem)] w-full max-w-130 overflow-y-auto overscroll-contain rounded-[20px] bg-white p-5.5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)]">
        {saved ? (
          <>
            <span
              className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success"
              aria-hidden="true">
              <CheckIcon className="size-6" />
            </span>
            <h2
              className="mt-4 text-center text-xl font-medium tracking-display text-main-heading"
              id="adjustment-dialog-title">
              Adjustment recorded
            </h2>
            <p
              className="mt-1.5 text-center text-sm leading-normal text-body-text"
              id="adjustment-dialog-description">
              The ledger entry has been added to the creator&apos;s balance and
              audit trail.
            </p>
            <div className="flex items-center justify-center">
              <Button
                ref={doneRef}
                className="mt-5 w-full max-w-xs"
                onClick={closeModal}>
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2
              className="text-xl font-medium tracking-display text-main-heading"
              id="adjustment-dialog-title">
              Record adjustment
            </h2>
            <p
              className="mt-1.5 text-sm leading-normal text-body-text"
              id="adjustment-dialog-description">
              Record money handled outside Tippy or make an audited correction.
              This does not move money.
            </p>

            <form className="mt-5" noValidate onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  ref={creatorRef}
                  label="Creator"
                  placeholder="Select a creator…"
                  value={creatorId}
                  error={creatorError}
                  required
                  disabled={busy}
                  onChange={(event) => {
                    setCreatorId(event.target.value);
                    setServerError("");
                  }}>
                  {creators.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.displayName} (@{option.username})
                    </option>
                  ))}
                </Select>

                <Select
                  label="Type"
                  value={type}
                  required
                  disabled={busy}
                  onChange={(event) => {
                    const nextType = event.target.value as AdjustmentType;
                    setType(nextType);
                    if (nextType === "manual_credit") setAllowNegative(false);
                    setServerError("");
                  }}>
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-4 space-y-4">
                <TextInput
                  label="Amount"
                  name="amount"
                  inputMode="numeric"
                  autoComplete="off"
                  leadingContent="₦"
                  placeholder="5,000"
                  value={amount}
                  error={amountError}
                  hint="Enter a positive, whole-naira amount. The type sets the sign."
                  required
                  disabled={busy}
                  onChange={(event) => {
                    setAmount(event.target.value.replace(/\D/g, ""));
                    setServerError("");
                  }}
                />

                <TextArea
                  label="Reason"
                  name="reason"
                  rows={3}
                  maxLength={500}
                  showCount
                  placeholder="Explain why this adjustment is needed"
                  value={reason}
                  error={reasonError}
                  hint="Required; at least 10 characters."
                  required
                  disabled={busy}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setServerError("");
                  }}
                />

                <TextInput
                  label="Related reference"
                  name="relatedReference"
                  placeholder="TIPPY-…"
                  spellCheck={false}
                  value={relatedReference}
                  hint="Optional tip or payout reference belonging to this creator."
                  disabled={busy}
                  onBlur={resolveReference}
                  onChange={(event) => {
                    setRelatedReference(event.target.value);
                    setRelatedTip(null);
                    setServerError("");
                  }}
                />

                {relatedTip && (
                  <p className="rounded-xl bg-soft px-3.5 py-3 text-sm text-body-text">
                    That tip: {formatNaira(relatedTip.gross)} gross ·{" "}
                    {formatNaira(relatedTip.fee)} fee ·{" "}
                    <strong className="font-semibold text-main-heading">
                      {formatNaira(relatedTip.net)} credited
                    </strong>
                    . A refund should normally debit the credited amount.
                  </p>
                )}

                {type !== "manual_credit" && (
                  <div className="rounded-xl bg-soft px-3.5 py-3">
                    <Switch
                      checked={allowNegative}
                      onCheckedChange={setAllowNegative}
                      label="Allow negative balance"
                      description="Permit this debit even when it exceeds the creator’s available balance."
                      disabled={busy}
                    />
                  </div>
                )}
              </div>

              {serverError && (
                <div className="mt-4">
                  <ErrorMessage>{serverError}</ErrorMessage>
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={busy} loadingText="Recording…">
                  Record
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}

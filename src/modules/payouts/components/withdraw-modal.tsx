"use client";

import { useEffect, useRef, useState } from "react";
import { play } from "cuelume";
import { formatAmountInput, sanitizeAmountInput } from "@/lib/amount-input";
import { cn } from "@/lib/cn";
import { formatNaira, maskAccountNumber } from "@/lib/utils";
import { requestWithdrawal } from "../actions";
import { CheckIcon } from "@/components/icons/check";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { MINIMUM_WITHDRAWAL } from "@/data/constants";
import {
  quotePayoutFromBalance,
  type WithdrawalQuote,
} from "@/lib/payout-fees";
import type { WithdrawModalProps } from "../types";

function buildQuote(
  amount: number,
  {
    account,
    destination,
    environment,
  }: Pick<WithdrawModalProps, "account" | "destination" | "environment">,
): WithdrawalQuote | null {
  if (!account || !destination) return null;
  try {
    return {
      ...quotePayoutFromBalance(amount, environment),
      destinationId: destination.id,
      destinationRevision: destination.revision,
      destinationBank: account.bank,
      destinationLast4: account.accountNumber.slice(-4),
    };
  } catch {
    return null;
  }
}

export function WithdrawModal({
  open,
  onClose,
  balance,
  account,
  destination,
  environment,
}: WithdrawModalProps) {
  const [amountValue, setAmountValue] = useState("");
  const [wasOpen, setWasOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const doneRef = useRef<HTMLButtonElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setAmountValue(String(balance));
      setDone(false);
      setServerError("");
    }
  }

  const amountNumber = Number(amountValue || 0);
  const quote = buildQuote(amountNumber, { account, destination, environment });
  const overBalance = amountNumber > balance;
  const belowMinimum = amountNumber > 0 && amountNumber < MINIMUM_WITHDRAWAL;
  const canConfirm =
    Boolean(quote) &&
    amountNumber >= MINIMUM_WITHDRAWAL &&
    !overBalance &&
    !submitting;
  const hintIsError = Boolean(serverError) || overBalance || belowMinimum;

  useEffect(() => {
    if (!open || !done) return;
    const frame = window.requestAnimationFrame(() => doneRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, done]);

  async function confirm() {
    if (!canConfirm || !quote) return;

    setSubmitting(true);
    setServerError("");
    try {
      const result = await requestWithdrawal(quote);
      if (result.error) {
        play("error");
        setServerError(result.error);
        return;
      }
      play("success");
      setDone(true);
    } catch {
      play("error");
      setServerError(
        "We couldn’t confirm the request. Check your payout history before trying again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="withdrawal-dialog-title"
      describedBy="withdrawal-dialog-description"
      dismissible={!submitting}
      initialFocusRef={done ? doneRef : amountRef}
      className="max-h-[calc(100dvh-2rem)] overflow-y-auto w-full max-w-105 rounded-[20px] bg-white p-5.5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)]">
      {done && quote ? (
        <>
          <span
            className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success"
            aria-hidden="true">
            <CheckIcon className="size-6" />
          </span>
          <h2
            className="mt-4 text-center text-xl font-medium tracking-display text-main-heading"
            id="withdrawal-dialog-title">
            Withdrawal requested
          </h2>
          <p
            className="mt-1.5 text-center text-sm leading-normal text-body-text"
            id="withdrawal-dialog-description">
            {formatNaira(quote.bankAmount)} is on its way to{" "}
            {quote.destinationBank} · **** {quote.destinationLast4}. Your
            balance was debited {formatNaira(quote.balanceDebit)}, including a{" "}
            {formatNaira(quote.creatorFeeAmount)} transfer fee.
          </p>
          <Button
            ref={doneRef}
            className="mt-5 min-h-11 w-full"
            onClick={onClose}>
            Done
          </Button>
        </>
      ) : (
        <>
          <h2
            className="text-xl font-medium tracking-display text-main-heading"
            id="withdrawal-dialog-title">
            Withdraw funds
          </h2>
          <p
            className="mt-1.5 text-sm leading-normal text-body-text"
            id="withdrawal-dialog-description">
            Choose how much of your balance to withdraw.
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label
                className="text-ui-sm font-medium text-copy"
                htmlFor="withdraw-amount">
                Amount from balance
              </label>
              <span className="text-xs text-muted-text">
                Available {formatNaira(balance)}
              </span>
            </div>
            <div className="relative mt-1.5">
              <span
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg font-medium text-muted-text"
                aria-hidden="true">
                ₦
              </span>
              <input
                disabled={submitting}
                ref={amountRef}
                id="withdraw-amount"
                className={cn(
                  "min-h-13 w-full rounded-xl bg-white pr-20 pl-9 text-lg font-medium text-main-heading tabular-nums shadow-surface outline-none transition-shadow duration-150 ease-out placeholder:font-normal placeholder:text-muted-text",
                  "focus:shadow-[inset_0_0_0_1px_var(--color-primary),0_0_0_4px_rgba(6,78,91,0.12),0_4px_12px_rgba(6,78,91,0.08)]",
                  (overBalance || belowMinimum) &&
                    "shadow-[inset_0_0_0_1px_var(--color-danger)]",
                )}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                aria-invalid={overBalance || belowMinimum}
                aria-describedby="withdraw-amount-hint"
                value={formatAmountInput(amountValue)}
                onChange={(event) => {
                  setAmountValue(sanitizeAmountInput(event.target.value));
                  if (serverError) setServerError("");
                }}
              />
              <button
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full bg-soft dark:bg-ink dark:hover:bg-copy/20 px-3 py-1.5 text-xs font-medium text-main-heading transition-colors duration-150 hover:bg-line"
                type="button"
                disabled={submitting}
                onClick={() => setAmountValue(String(balance))}>
                Max
              </button>
            </div>
            <p
              className={cn(
                "mt-1.5 text-xs",
                hintIsError ? "text-danger" : "text-muted-text",
              )}
              role={serverError ? "alert" : undefined}
              id="withdraw-amount-hint">
              {serverError ||
                (overBalance
                  ? "Amount exceeds your available balance."
                  : belowMinimum
                    ? `Minimum withdrawal is ${formatNaira(MINIMUM_WITHDRAWAL)}.`
                    : "Enter an amount or tap Max to withdraw everything.")}
            </p>
          </div>

          <dl className="mt-4 divide-y divide-line rounded-surface bg-soft dark:bg-ink dark:divide-copy/20 px-4">
            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="text-ui-sm text-muted-text">Account</dt>
              <dd className="text-right text-ui-sm font-medium text-main-heading">
                {account
                  ? `${account.bank} · ${maskAccountNumber(account.accountNumber)}`
                  : "—"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="text-ui-sm text-muted-text">Withdrawal amount</dt>
              <dd className="text-ui-sm font-medium text-main-heading">
                {formatNaira(amountNumber)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="text-ui-sm text-muted-text">Processing fee</dt>
              <dd className="text-right text-ui-sm font-medium text-main-heading">
                {quote ? formatNaira(quote.creatorFeeAmount) : "—"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="text-ui-sm text-muted-text">You receive</dt>
              <dd className="text-right text-ui-sm font-medium text-main-heading">
                {quote ? formatNaira(quote.bankAmount) : "—"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3.5">
              <dt className="text-ui-sm text-muted-text">Estimated arrival</dt>
              <dd className="text-ui-sm font-medium text-main-heading">
                Within minutes
              </dd>
            </div>
          </dl>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={submitting}
              onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="min-h-11"
              disabled={!canConfirm}
              loading={submitting}
              loadingText="Requesting…"
              onClick={confirm}>
              Confirm withdrawal
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

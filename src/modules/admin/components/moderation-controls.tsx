"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { MINIMUM_WITHDRAWAL } from "@/data/constants";
import { formatNaira } from "@/lib/utils";
import {
  suspendCreator,
  unsuspendCreator,
  freezeCreatorPayouts,
  unfreezeCreatorPayouts,
  reconcileCreatorPayoutsAction,
  payOutBelowMinimumAction,
} from "../actions";
import { PENDING_OPERATOR_ACTION_LABELS } from "../data";
import type { PendingOperatorAction } from "../types";

export function ModerationControls({
  creatorId,
  suspended,
  payoutsFrozen,
  balance,
}: {
  creatorId: string;
  suspended: boolean;
  payoutsFrozen: boolean;
  balance: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingOperatorAction | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [payingOut, setPayingOut] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const stranded =
    balance > 0 && balance < MINIMUM_WITHDRAWAL && !suspended && !payoutsFrozen;

  async function payOut() {
    if (
      !window.confirm(
        `Send ${formatNaira(balance)} to this creator's bank account now? This bypasses the ${formatNaira(MINIMUM_WITHDRAWAL)} minimum.`,
      )
    ) {
      return;
    }

    setPayingOut(true);
    setError("");
    setNotice("");
    const result = await payOutBelowMinimumAction(creatorId);
    setPayingOut(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setNotice(result.result ?? "Payout sent.");
    router.refresh();
  }

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    setError("");

    const action =
      pending === "suspend"
        ? suspendCreator
        : pending === "unsuspend"
          ? unsuspendCreator
          : pending === "freeze"
            ? freezeCreatorPayouts
            : unfreezeCreatorPayouts;

    const result = await action({ creatorId, reason });
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setPending(null);
    setReason("");
    router.refresh();
  }

  async function reconcile() {
    setReconciling(true);
    setError("");
    const result = await reconcileCreatorPayoutsAction(creatorId);
    setReconciling(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (pending) {
    return (
      <div className="rounded-xl p-4 shadow-surface">
        <p className="text-sm font-semibold text-main-heading">
          {PENDING_OPERATOR_ACTION_LABELS[pending].confirm}
        </p>
        <div className="mt-3">
          <TextInput
            label="Reason (recorded in the audit trail)"
            name="reason"
            value={reason}
            error={error}
            placeholder="Why are you doing this?"
            onChange={(event) => {
              setReason(event.target.value);
              if (error) setError("");
            }}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            loading={busy}
            loadingText="Applying…"
            onClick={confirm}>
            Confirm
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              setPending(null);
              setError("");
            }}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setPending(suspended ? "unsuspend" : "suspend")}>
          {suspended
            ? PENDING_OPERATOR_ACTION_LABELS.unsuspend.button
            : PENDING_OPERATOR_ACTION_LABELS.suspend.button}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setPending(payoutsFrozen ? "unfreeze" : "freeze")}>
          {payoutsFrozen
            ? PENDING_OPERATOR_ACTION_LABELS.unfreeze.button
            : PENDING_OPERATOR_ACTION_LABELS.freeze.button}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={reconciling}
          loadingText="Reconciling…"
          onClick={reconcile}>
          Reconcile stale payouts
        </Button>
        {stranded && (
          <Button
            size="sm"
            variant="secondary"
            loading={payingOut}
            loadingText="Sending…"
            onClick={payOut}>
            Pay out {formatNaira(balance)} (below minimum)
          </Button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-danger" role="status">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-2 text-sm text-success" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  reconcileTipAction,
  reconcilePayoutAction,
  fetchProviderStateAction,
} from "../actions/reconciliation";

export function LookupActions({
  paymentReference,
  kind,
}: {
  paymentReference: string;
  kind: "tip" | "payout";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"reconcile" | "fetch" | null>(null);
  const [message, setMessage] = useState("");
  const [providerState, setProviderState] = useState<Record<
    string,
    unknown
  > | null>(null);

  async function reconcile() {
    setBusy("reconcile");
    setMessage("");
    const result =
      kind === "tip"
        ? await reconcileTipAction(paymentReference)
        : await reconcilePayoutAction(paymentReference);
    setBusy(null);

    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage(`Reconciled — provider says: ${result.result}.`);
    router.refresh();
  }

  async function fetchProviderState() {
    setBusy("fetch");
    setMessage("");
    setProviderState(null);
    const result = await fetchProviderStateAction(paymentReference, kind);
    setBusy(null);

    if ("error" in result) {
      setMessage(result.error);
      return;
    }

    const record =
      "transaction" in result ? result.transaction : result.transfer;
    if (!record) {
      setMessage("The provider has no record of this reference.");
      return;
    }
    setProviderState(record as unknown as Record<string, unknown>);
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          loading={busy === "reconcile"}
          loadingText="Reconciling…"
          onClick={reconcile}>
          Reconcile with Monnify
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={busy === "fetch"}
          loadingText="Fetching…"
          onClick={fetchProviderState}>
          Fetch provider state
        </Button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-body-text" role="status">
          {message}
        </p>
      )}

      {providerState && (
        <pre className="mt-3 overflow-x-auto rounded-md bg-soft p-3 font-mono text-xs text-body-text">
          {JSON.stringify(providerState, null, 2)}
        </pre>
      )}
    </div>
  );
}

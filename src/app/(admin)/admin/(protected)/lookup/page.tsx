import Link from "next/link";
import { lookupReference } from "@/modules/admin/queries";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { formatAdminDateTime } from "@/modules/admin/format";
import { LookupActions } from "@/modules/admin/components/lookup-actions";
import { PageHeader } from "@/components/elements/page-header";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "success" || status === "paid"
      ? "bg-soft text-ink"
      : status === "failed"
        ? "bg-danger-soft text-danger"
        : "bg-soft text-muted-text";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone,
      )}>
      {status}
    </span>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-text">{label}</dt>
      <dd className="mt-0.5 text-sm break-all text-body-text">{value}</dd>
    </div>
  );
}

export default async function AdminLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const reference = ref?.trim() ?? "";
  const result = reference ? await lookupReference(reference) : null;

  return (
    <section>
      <PageHeader
        title="Reference lookup"
        description="Find a tip or payout by Tippy reference (TIPPY-…) or Monnify reference."
      />

      <form className="mt-5 flex max-w-120 gap-2" action="/admin/lookup">
        <TextInput
          label="Payment reference"
          visuallyHideLabel
          size="sm"
          className="font-mono placeholder:font-sans"
          type="text"
          name="ref"
          placeholder="TIPPY-…"
          defaultValue={reference}
          spellCheck={false}
        />
        <Button size="sm" type="submit">
          Search
        </Button>
      </form>

      {result && (
        <div className="mt-8 space-y-8">
          {!result.tip && !result.payout && result.events.length === 0 && (
            <p className="text-muted-text">
              Nothing found for{" "}
              <code className="font-mono text-sm">{reference}</code> — checked
              tips, payouts, and webhook deliveries.
            </p>
          )}

          {result.tip && (
            <div className="rounded-xl p-5 shadow-surface">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-main-heading">Tip</h2>
                <StatusBadge status={result.tip.status} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                <Field label="Amount" value={formatNaira(result.tip.amount)} />
                <Field
                  label="Paid (provider)"
                  value={
                    result.tip.amountPaid !== null
                      ? formatNaira(result.tip.amountPaid)
                      : "—"
                  }
                />
                <Field
                  label="Settled (provider)"
                  value={
                    result.tip.providerSettlementAmount !== null
                      ? formatNaira(result.tip.providerSettlementAmount)
                      : "—"
                  }
                />
                <Field
                  label="Creator"
                  value={
                    result.tip.creator ? (
                      <Link
                        className="font-medium text-main-heading hover:underline"
                        href={`/admin/creators/${result.tip.creator.id}`}>
                        {result.tip.creator.displayName} (@
                        {result.tip.creator.username})
                      </Link>
                    ) : (
                      "Unknown"
                    )
                  }
                />
                <Field
                  label="Created"
                  value={formatAdminDateTime(result.tip.createdAt)}
                />
                <Field
                  label="Tippy reference"
                  value={
                    <code className="font-mono">
                      {result.tip.paymentReference}
                    </code>
                  }
                />
                <Field
                  label="Provider reference"
                  value={
                    result.tip.providerReference ? (
                      <code className="font-mono">
                        {result.tip.providerReference}
                      </code>
                    ) : (
                      "—"
                    )
                  }
                />
                <Field
                  label="Updated"
                  value={formatAdminDateTime(result.tip.updatedAt)}
                />
              </dl>
              <LookupActions
                paymentReference={result.tip.paymentReference}
                kind="tip"
              />
            </div>
          )}

          {result.payout && (
            <div className="rounded-xl p-5 shadow-surface">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-main-heading">Payout</h2>
                <StatusBadge status={result.payout.status} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                <Field
                  label="To creator’s bank"
                  value={formatNaira(result.payout.amount)}
                />
                <Field
                  label="Monnify fee"
                  value={formatNaira(result.payout.providerFeeAmount)}
                />
                <Field
                  label="Total balance debit"
                  value={formatNaira(
                    result.payout.amount + result.payout.providerFeeAmount,
                  )}
                />
                <Field
                  label="Creator"
                  value={
                    result.payout.creator ? (
                      <Link
                        className="font-medium text-main-heading hover:underline"
                        href={`/admin/creators/${result.payout.creator.id}`}>
                        {result.payout.creator.displayName} (@
                        {result.payout.creator.username})
                      </Link>
                    ) : (
                      "Unknown"
                    )
                  }
                />
                <Field
                  label="Created"
                  value={formatAdminDateTime(result.payout.createdAt)}
                />
                <Field
                  label="Tippy reference"
                  value={
                    <code className="font-mono">
                      {result.payout.paymentReference}
                    </code>
                  }
                />
                <Field
                  label="Paid at"
                  value={
                    result.payout.paidAt
                      ? formatAdminDateTime(result.payout.paidAt)
                      : "—"
                  }
                />
                <Field
                  label="Failure reason"
                  value={result.payout.failureReason ?? "—"}
                />
              </dl>
              <LookupActions
                paymentReference={result.payout.paymentReference}
                kind="payout"
              />
            </div>
          )}

          {result.events.length > 0 && (
            <div>
              <h2 className="font-semibold text-main-heading">
                Webhook deliveries ({result.events.length})
              </h2>
              <div className="mt-3 space-y-3">
                {result.events.map((event) => (
                  <details
                    key={event.id}
                    className="rounded-xl p-4 shadow-surface">
                    <summary className="cursor-pointer text-sm font-medium text-body-text">
                      {event.eventType ?? "unknown event"} ·{" "}
                      {formatAdminDateTime(event.receivedAt)} ·{" "}
                      {event.signatureValid ? "signed" : "unsigned"} ·{" "}
                      {event.processingOutcome ?? "unprocessed"}
                      {event.receivedCount > 1
                        ? ` · delivered ${event.receivedCount}×`
                        : ""}
                    </summary>
                    {event.processingError && (
                      <p className="mt-2 text-sm text-danger">
                        {event.processingError}
                      </p>
                    )}
                    <pre className="mt-3 overflow-x-auto rounded-md bg-soft p-3 font-mono text-xs text-body-text">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

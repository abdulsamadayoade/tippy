import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorDetail } from "@/modules/admin/queries";
import { formatNaira } from "@/lib/utils";
import { formatAdminDateTime } from "@/modules/admin/format";
import { CreatorDetailTabs } from "@/modules/admin/components/creator-detail-tabs";
import { CreatorTipsTable } from "@/modules/admin/components/creator-tips-table";
import { ModerationControls } from "@/modules/admin/components/moderation-controls";
import { Pagination } from "@/components/elements/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 font-semibold text-main-heading">{title}</h2>
      {children}
    </div>
  );
}

export default async function AdminCreatorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const requestedPage = Number(query.page);
  const tipPage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const detail = await getCreatorDetail(id, tipPage);
  if (!detail) notFound();

  const {
    creator: row,
    email,
    balance,
    tipTotal,
    tipCount,
    tips,
    totalTips,
    tipPageSize,
    bankAccount,
    payouts,
    adjustments,
    reports,
    auditEntries,
  } = detail;
  const totalTipPages = Math.max(1, Math.ceil(totalTips / tipPageSize));

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-main-heading">
          {row.displayName}
        </h1>
        <Link
          className="text-sm font-medium text-muted-text hover:underline"
          href={`/${row.username}`}
          target="_blank">
          @{row.username} ↗
        </Link>
        {row.suspended && (
          <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
            suspended
          </span>
        )}
        {row.payoutsFrozen && (
          <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
            payouts frozen
          </span>
        )}
      </div>

      <div>
        <p className="mt-1 text-sm text-muted-text">
          {email ?? "No email on file"} · joined{" "}
          <time dateTime={row.createdAt.toISOString()}>
            {formatAdminDateTime(row.createdAt)}
          </time>
        </p>
        {row.payoutsFrozen && row.frozenReason && (
          <p className="mt-2 text-sm text-danger">
            Frozen {row.frozenAt ? formatAdminDateTime(row.frozenAt) : "—"}:{" "}
            {row.frozenReason}
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <div className="rounded-xl p-4 shadow-surface">
          <p className="text-xs font-medium text-muted-text">
            Available balance
          </p>
          <p className="mt-1 text-xl font-semibold text-main-heading">
            {formatNaira(balance)}
          </p>
        </div>

        <div className="rounded-xl p-4 shadow-surface">
          <p className="text-xs font-medium text-muted-text">Settled tips</p>
          <p className="mt-1 text-xl font-semibold text-main-heading">
            {formatNaira(tipTotal)}{" "}
            <span className="text-sm font-normal text-muted-text">
              ({tipCount})
            </span>
          </p>
        </div>

        <div className="rounded-xl p-4 shadow-surface">
          <p className="text-xs font-medium text-muted-text">Bank account</p>
          <p className="mt-1 text-sm font-medium text-body-text">
            {bankAccount
              ? `${bankAccount.bankName} ····${bankAccount.accountNumberLast4} (${bankAccount.accountName})`
              : "None linked"}
          </p>
          {bankAccount && (
            <p className="mt-0.5 text-xs text-muted-text">
              Updated{" "}
              <time dateTime={bankAccount.updatedAt.toISOString()}>
                {formatAdminDateTime(bankAccount.updatedAt)}
              </time>
            </p>
          )}
        </div>
      </div>

      <Section title="Actions">
        <ModerationControls
          creatorId={row.id}
          suspended={row.suspended}
          payoutsFrozen={row.payoutsFrozen}
          balance={balance}
        />
      </Section>

      <CreatorDetailTabs
        tabs={[
          {
            value: "tips",
            label: "Tips",
            content:
              tips.length === 0 ? (
                <p className="text-sm text-muted-text">
                  {totalTips === 0 ? "No tips yet." : "No tips on this page."}
                </p>
              ) : (
                <>
                  <CreatorTipsTable
                    tips={tips.map((tip) => ({
                      ...tip,
                      createdAt: tip.createdAt.toISOString(),
                    }))}
                  />
                  <Pagination
                    page={tipPage}
                    totalPages={totalTipPages}
                    pathname={`/admin/creators/${row.id}`}
                    previousLabel="Newer"
                    nextLabel="Older"
                  />
                </>
              ),
          },
          {
            value: "withdrawals",
            label: "Withdrawals",
            content:
              payouts.length === 0 ? (
                <p className="text-sm text-muted-text">No payouts yet.</p>
              ) : (
                <Table aria-label="Creator withdrawals">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>To bank</TableHead>
                      <TableHead>Monnify fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="whitespace-nowrap text-body-text">
                          <time dateTime={payout.createdAt.toISOString()}>
                            {formatAdminDateTime(payout.createdAt)}
                          </time>
                        </TableCell>
                        <TableCell className="text-body-text">
                          {formatNaira(payout.amount)}
                        </TableCell>
                        <TableCell className="text-body-text">
                          {formatNaira(payout.providerFeeAmount)}
                        </TableCell>
                        <TableCell className="text-body-text">
                          {payout.status}
                          {payout.failureReason && (
                            <span className="block text-xs text-danger">
                              {payout.failureReason}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            className="font-mono text-xs text-main-heading hover:underline"
                            href={`/admin/lookup?ref=${encodeURIComponent(payout.paymentReference)}`}>
                            {payout.paymentReference}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ),
          },
          {
            value: "adjustments",
            label: "Adjustments",
            content:
              adjustments.length === 0 ? (
                <p className="text-sm text-muted-text">
                  No refunds, reversals, or manual adjustments.
                </p>
              ) : (
                <ul className="space-y-2">
                  {adjustments.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-xl p-3 shadow-surface">
                      <p className="text-sm font-medium text-body-text">
                        {entry.type.replace("_", " ")} ·{" "}
                        {formatNaira(entry.amount)} ·{" "}
                        {formatAdminDateTime(entry.createdAt)}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-text">
                        {entry.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              ),
          },
          {
            value: "reports",
            label: "Abuse reports",
            content:
              reports.length === 0 ? (
                <p className="text-sm text-muted-text">No reports.</p>
              ) : (
                <ul className="space-y-2">
                  {reports.map((report) => (
                    <li
                      key={report.id}
                      className="rounded-xl p-3 shadow-surface">
                      <p className="text-sm font-medium text-body-text">
                        {report.reason} ·{" "}
                        {formatAdminDateTime(report.createdAt)}
                      </p>
                      {report.details && (
                        <p className="mt-0.5 text-sm text-muted-text">
                          {report.details}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ),
          },
          {
            value: "account-history",
            label: "Account history",
            content:
              auditEntries.length === 0 ? (
                <p className="text-sm text-muted-text">
                  No recorded changes for this creator yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {auditEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-xl p-3 shadow-surface">
                      <p className="text-sm font-medium text-body-text">
                        {entry.action} · {entry.actorType} ·{" "}
                        {formatAdminDateTime(entry.createdAt)}
                      </p>
                      {entry.details && (
                        <pre className="mt-1 overflow-x-auto font-mono text-xs text-muted-text">
                          {JSON.stringify(entry.details)}
                        </pre>
                      )}
                    </li>
                  ))}
                </ul>
              ),
          },
        ]}
      />
    </section>
  );
}

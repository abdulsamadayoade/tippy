import Link from "next/link";
import { listAbuseReports } from "@/modules/admin/queries";
import { formatAdminDateTime } from "@/modules/admin/format";
import { PageHeader } from "@/components/elements/page-header";
import { REPORT_REASONS } from "@/data/report-reasons";
import { UserIcon } from "@/components/icons/user";
import { ClockIcon } from "@/components/icons/clock";

export default async function AdminReportsPage() {
  const reports = await listAbuseReports();

  return (
    <section>
      <PageHeader
        title="Abuse reports"
        description="Reports filed from public tip pages, newest first."
      />

      {reports.length === 0 ? (
        <p className="mt-8 text-muted-text">No reports. This is good!</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-xl p-4 shadow-surface">
              <div className="flex items-center gap-1">
                <UserIcon />
                <div className="flex flex-wrap flex-1 justify-between items-center gap-2">
                  <Link
                    className="font-medium text-main-heading hover:underline"
                    href={`/admin/creators/${report.creatorId}`}>
                    {report.displayName} (@{report.username})
                  </Link>
                  {report.creatorSuspended && (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                      suspended
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-text flex items-center gap-1">
                    <ClockIcon />
                    {formatAdminDateTime(report.createdAt)}
                  </span>
                </div>
              </div>
              <p className="mt-2.5 text-sm font-medium text-body-text">
                {REPORT_REASONS.find(({ value }) => value === report.reason)
                  ?.label ?? report.reason}
              </p>
              {report.details && (
                <p className="mt-1.5 mb-2.5 text-sm text-muted-text">
                  {report.details}
                </p>
              )}
              {report.reporterEmail && (
                <p className="text-xs text-muted-text">
                  Reported by {report.reporterEmail}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

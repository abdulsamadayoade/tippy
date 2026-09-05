import Link from "next/link";
import { listAuditLog, type AuditLogFilters } from "@/modules/admin/queries";
import { PageHeader } from "@/components/elements/page-header";

function parseFilters(params: Record<string, string | undefined>): {
  filters: AuditLogFilters;
  query: Record<string, string>;
} {
  const filters: AuditLogFilters = {};
  const query: Record<string, string> = {};

  if (
    params.actor === "admin" ||
    params.actor === "creator" ||
    params.actor === "system"
  ) {
    filters.actorType = params.actor;
    query.actor = params.actor;
  }
  if (params.action?.trim()) {
    filters.action = params.action.trim();
    query.action = filters.action;
  }
  if (params.target?.trim()) {
    filters.targetId = params.target.trim();
    query.target = filters.targetId;
  }
  if (params.from) {
    const from = new Date(params.from);
    if (!Number.isNaN(from.getTime())) {
      filters.from = from;
      query.from = params.from;
    }
  }
  if (params.to) {
    // Inclusive end-of-day for a bare date input.
    const to = new Date(`${params.to}T23:59:59.999`);
    if (!Number.isNaN(to.getTime())) {
      filters.to = to;
      query.to = params.to;
    }
  }

  return { filters, query };
}

const inputClassName =
  "min-h-10 rounded-xl bg-white px-3 text-sm text-body-text shadow-surface outline-none placeholder:text-muted-text";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { filters, query } = parseFilters(params);
  const page = Math.max(1, Number(params.page) || 1);

  const { entries, total, pageSize } = await listAuditLog(filters, page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const exportQuery = new URLSearchParams(query).toString();

  return (
    <section>
      <PageHeader
        title="Audit trail"
        description="Append-only log of admin and system actions.">
        <a
          className="rounded-full bg-soft px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-line"
          href={`/api/admin/audit-export${exportQuery ? `?${exportQuery}` : ""}`}>
          Export CSV
        </a>
      </PageHeader>

      <form
        className="mt-5 flex flex-wrap items-end gap-2"
        action="/admin/audit">
        <select
          className={inputClassName}
          name="actor"
          defaultValue={query.actor ?? ""}
          aria-label="Actor type">
          <option value="">Any actor</option>
          <option value="admin">Admin</option>
          <option value="creator">Creator</option>
          <option value="system">System</option>
        </select>
        <input
          className={inputClassName}
          type="text"
          name="action"
          placeholder="Action contains…"
          defaultValue={query.action ?? ""}
          aria-label="Action"
        />
        <input
          className={inputClassName}
          type="text"
          name="target"
          placeholder="Target id"
          defaultValue={query.target ?? ""}
          aria-label="Target id"
        />
        <input
          className={inputClassName}
          type="date"
          name="from"
          defaultValue={query.from ?? ""}
          aria-label="From date"
        />
        <input
          className={inputClassName}
          type="date"
          name="to"
          defaultValue={query.to ?? ""}
          aria-label="To date"
        />
        <button
          className="min-h-10 cursor-pointer rounded-full bg-primary px-5 text-sm font-medium text-white"
          type="submit">
          Filter
        </button>
      </form>

      {total > 0 && (
        <p className="mt-4 text-sm text-muted-text">
          {total} matching {total === 1 ? "entry" : "entries"}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="mt-4 text-muted-text">Nothing matches these filters.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted-text">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">When</th>
                <th className="py-2 pr-4 font-medium">Actor</th>
                <th className="py-2 pr-4 font-medium">Action</th>
                <th className="py-2 pr-4 font-medium">Target</th>
                <th className="py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="py-2 pr-4 font-mono text-xs text-muted-text">
                    {entry.id}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap text-body-text">
                    {entry.createdAt.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 text-body-text">
                    {entry.actorType}
                    {entry.actorEmail ? (
                      <span className="block text-xs text-muted-text">
                        {entry.actorEmail}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4 font-medium text-main-heading">
                    {entry.action}
                  </td>
                  <td className="py-2 pr-4 text-body-text">
                    {entry.targetType ? (
                      <>
                        {entry.targetType}
                        <span className="block max-w-40 truncate font-mono text-xs text-muted-text">
                          {entry.targetId}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-90 py-2">
                    {entry.details ? (
                      <pre className="overflow-x-auto font-mono text-xs text-muted-text">
                        {JSON.stringify(entry.details)}
                      </pre>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center gap-3" aria-label="Pagination">
          {page > 1 ? (
            <Link
              className="rounded-full bg-soft px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-line"
              href={{
                pathname: "/admin/audit",
                query: { ...query, page: String(page - 1) },
              }}>
              Newer
            </Link>
          ) : null}
          <span className="text-sm text-muted-text">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              className="rounded-full bg-soft px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-line"
              href={{
                pathname: "/admin/audit",
                query: { ...query, page: String(page + 1) },
              }}>
              Older
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}

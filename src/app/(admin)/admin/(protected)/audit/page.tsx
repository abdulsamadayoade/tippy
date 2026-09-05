import { listAuditLog, type AuditLogFilters } from "@/modules/admin/queries";
import { PageHeader } from "@/components/elements/page-header";
import { Pagination } from "@/components/elements/pagination";
import { AuditLogTable } from "@/modules/admin/components/audit-log-table";
import { ExportIcon } from "@/components/icons/export";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

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
          className="rounded-full inline-flex items-center gap-1.5 bg-soft px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-line"
          href={`/api/admin/audit-export${exportQuery ? `?${exportQuery}` : ""}`}>
          <ExportIcon />
          Export
        </a>
      </PageHeader>

      <form
        className="mt-5 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[9rem_minmax(10rem,1fr)_10.5rem_10.5rem_auto]"
        action="/admin/audit">
        <Select label="Actor" name="actor" defaultValue={query.actor ?? ""}>
          <option value="">Any actor</option>
          <option value="admin">Admin</option>
          <option value="creator">Creator</option>
          <option value="system">System</option>
        </Select>
        <TextInput
          label="Action"
          name="action"
          placeholder="Action contains…"
          defaultValue={query.action ?? ""}
        />
        <DatePicker
          label="From"
          pickerLabel="Open from-date picker"
          name="from"
          defaultValue={query.from ?? ""}
        />
        <DatePicker
          label="To"
          pickerLabel="Open to-date picker"
          name="to"
          defaultValue={query.to ?? ""}
        />
        <Button className="w-full xl:w-auto" type="submit">
          Filter
        </Button>
      </form>

      {total > 0 && (
        <p className="mt-4 text-sm text-muted-text">
          {total} matching {total === 1 ? "entry" : "entries"}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="mt-4 text-muted-text">Nothing matches these filters.</p>
      ) : (
        <AuditLogTable
          entries={entries.map((entry) => ({
            ...entry,
            createdAt: entry.createdAt.toISOString(),
          }))}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pathname="/admin/audit"
        query={query}
        previousLabel="Newer"
        nextLabel="Older"
      />
    </section>
  );
}

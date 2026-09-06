import Link from "next/link";
import { listCreators, type CreatorListFilter } from "@/modules/admin/queries";
import { cn } from "@/lib/cn";
import { formatAdminDateTime } from "@/modules/admin/format";
import { PageHeader } from "@/components/elements/page-header";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

const FILTERS: Array<{ value: CreatorListFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "suspended", label: "Suspended" },
  { value: "frozen", label: "Frozen payouts" },
];

export default async function AdminCreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const filter: CreatorListFilter =
    params.filter === "suspended" || params.filter === "frozen"
      ? params.filter
      : "all";

  const creators = await listCreators({
    search: search || undefined,
    filter,
  });

  return (
    <section>
      <PageHeader title="Creators" />

      <form className="mt-5 flex max-w-120 gap-2" action="/admin/creators">
        {filter !== "all" && (
          <input type="hidden" name="filter" value={filter} />
        )}
        <TextInput
          label="Search creators"
          visuallyHideLabel
          size="sm"
          type="text"
          name="q"
          placeholder="Search username or display name"
          defaultValue={search}
        />
        <Button size="sm" type="submit">
          Search
        </Button>
      </form>

      <div className="mt-4 flex gap-1.5">
        {FILTERS.map((option) => (
          <Link
            key={option.value}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              option.value === filter
                ? "bg-primary text-white"
                : "bg-soft text-ink hover:bg-line",
            )}
            href={{
              pathname: "/admin/creators",
              query: {
                ...(search ? { q: search } : {}),
                ...(option.value !== "all" ? { filter: option.value } : {}),
              },
            }}>
            {option.label}
          </Link>
        ))}
      </div>

      {creators.length === 0 ? (
        <p className="mt-8 text-muted-text">No creators match.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line">
          {creators.map((row) => (
            <li key={row.id}>
              <Link
                className="flex items-center gap-3 py-3 hover:bg-soft px-2"
                href={`/admin/creators/${row.id}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-main-heading">
                    {row.displayName}{" "}
                    <span className="font-normal text-muted-text">
                      @{row.username}
                    </span>
                  </p>
                  <p className="text-xs text-muted-text">
                    Joined{" "}
                    <time dateTime={row.createdAt.toISOString()}>
                      {formatAdminDateTime(row.createdAt)}
                    </time>
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 gap-1.5">
                  {row.suspended && (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                      suspended
                    </span>
                  )}
                  {row.payoutsFrozen && (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                      frozen
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

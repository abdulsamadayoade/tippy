import { ButtonLink } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  pathname: string;
  query?: Record<string, string>;
  previousLabel?: string;
  nextLabel?: string;
};

export function Pagination({
  page,
  totalPages,
  pathname,
  query = {},
  previousLabel = "Previous",
  nextLabel = "Next",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefForPage = (targetPage: number) => ({
    pathname,
    query: { ...query, page: String(targetPage) },
  });

  return (
    <nav
      className="mt-6 flex items-center justify-end gap-3"
      aria-label="Pagination">
      {page > 1 && (
        <ButtonLink href={hrefForPage(page - 1)} variant="secondary" size="xs">
          {previousLabel}
        </ButtonLink>
      )}

      <span className="text-sm text-muted-text">
        Page {page} of {totalPages}
      </span>

      {page < totalPages && (
        <ButtonLink href={hrefForPage(page + 1)} variant="secondary" size="xs">
          {nextLabel}
        </ButtonLink>
      )}
    </nav>
  );
}

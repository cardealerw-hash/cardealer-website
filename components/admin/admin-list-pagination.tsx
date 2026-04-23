import Link from "next/link";

import { Button } from "@/components/ui/button";

function buildPageHref(
  basePath: string,
  query: Record<string, string | number | undefined | null>,
  page: number,
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (key === "page") {
      return;
    }

    params.set(key, String(value));
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1);
  }

  if (currentPage <= 2) {
    pages.add(2);
  }

  if (currentPage >= totalPages - 1) {
    pages.add(totalPages - 1);
  }

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

export function AdminListPagination({
  ariaLabel,
  basePath,
  itemLabel,
  page,
  pageSize,
  query,
  totalItems,
  totalPages,
}: {
  ariaLabel: string;
  basePath: string;
  itemLabel: string;
  page: number;
  pageSize: number;
  query: Record<string, string | number | undefined | null>;
  totalItems: number;
  totalPages: number;
}) {
  if (!totalItems) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 px-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-stone-600">
        Showing {start}-{end} of {totalItems} {itemLabel}
      </p>

      {totalPages > 1 ? (
        <nav
          aria-label={ariaLabel}
          className="flex flex-wrap items-center gap-2"
        >
          {page > 1 ? (
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href={buildPageHref(basePath, query, page - 1)}>Previous</Link>
            </Button>
          ) : (
            <span className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-xs font-semibold text-stone-400">
              Previous
            </span>
          )}

          {visiblePages.map((visiblePage, index) => {
            const previousPage = visiblePages[index - 1];
            const showGap = previousPage && visiblePage - previousPage > 1;

            return (
              <div key={visiblePage} className="flex items-center gap-2">
                {showGap ? (
                  <span className="px-1 text-sm text-stone-400" aria-hidden="true">
                    …
                  </span>
                ) : null}

                <Button
                  asChild
                  size="sm"
                  variant={visiblePage === page ? "primary" : "secondary"}
                  className="min-w-10 rounded-full px-3"
                >
                  <Link
                    href={buildPageHref(basePath, query, visiblePage)}
                    aria-current={visiblePage === page ? "page" : undefined}
                  >
                    {visiblePage}
                  </Link>
                </Button>
              </div>
            );
          })}

          {page < totalPages ? (
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href={buildPageHref(basePath, query, page + 1)}>Next</Link>
            </Button>
          ) : (
            <span className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-4 text-xs font-semibold text-stone-400">
              Next
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}

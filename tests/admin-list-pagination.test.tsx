import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminListPagination } from "@/components/admin/admin-list-pagination";

describe("AdminListPagination", () => {
  it("renders a compact summary and preserves query params across page links", () => {
    render(
      <AdminListPagination
        ariaLabel="Lead inbox pages"
        basePath="/admin/leads"
        itemLabel="leads"
        page={2}
        pageSize={5}
        query={{
          status: "new",
          q: "kamau",
        }}
        totalItems={18}
        totalPages={4}
      />,
    );

    expect(screen.getByText("Showing 6-10 of 18 leads")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/admin/leads?status=new&q=kamau",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/admin/leads?status=new&q=kamau&page=3",
    );
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

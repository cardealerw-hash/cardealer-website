import { describe, expect, it } from "vitest";

import { resolveVehicleIdentifiers } from "@/lib/data/filters";

describe("resolveVehicleIdentifiers", () => {
  it("keeps the current vehicle identifiers when editing the same record", () => {
    const result = resolveVehicleIdentifiers(
      {
        id: "vehicle-1",
        title: "2020 Toyota Prado",
        stockCode: "2020-TOY-PRA",
        slug: "2020-toyota-prado",
      },
      [
        {
          id: "vehicle-1",
          stockCode: "2020-TOY-PRA",
          slug: "2020-toyota-prado",
        },
        {
          id: "vehicle-2",
          stockCode: "2021-TOY-HIL",
          slug: "2021-toyota-hilux",
        },
      ],
    );

    expect(result).toEqual({
      stockCode: "2020-TOY-PRA",
      slug: "2020-toyota-prado",
    });
  });

  it("appends numeric suffixes when another vehicle already uses the same identifiers", () => {
    const result = resolveVehicleIdentifiers(
      {
        title: "2020 Toyota Prado",
        stockCode: "2020-TOY-PRA",
        slug: "2020-toyota-prado",
      },
      [
        {
          id: "vehicle-1",
          stockCode: "2020-TOY-PRA",
          slug: "2020-toyota-prado",
        },
        {
          id: "vehicle-2",
          stockCode: "2020-TOY-PRA-2",
          slug: "2020-toyota-prado-2",
        },
      ],
    );

    expect(result).toEqual({
      stockCode: "2020-TOY-PRA-3",
      slug: "2020-toyota-prado-3",
    });
  });
});

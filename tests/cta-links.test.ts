import { describe, expect, it } from "vitest";

import { buildWhatsAppUrl } from "@/lib/utils";

describe("CTA helpers", () => {
  it("builds encoded whatsapp links from local numbers", () => {
    const url = buildWhatsAppUrl("Hi, is this car available?", "0792141523");

    expect(url).toContain("wa.me/254792141523");
    expect(url).toContain("Hi%2C%20is%20this%20car%20available%3F");
  });
});

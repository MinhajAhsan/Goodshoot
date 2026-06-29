import { describe, it, expect } from "vitest";
import { generateQuote } from "@/lib/quoteEngine";
import type { QuestionnaireAnswers } from "@/lib/questionnaire";

const settings = { baseAmount: 20000, quoteValidityHours: 24 };

const baseAnswers: QuestionnaireAnswers = {
  eventType: "wedding",
  cityId: "00000000-0000-0000-0000-000000000000",
  eventDate: "2026-08-01",
  durationHours: 2, // == INCLUDED_HOURS, so durationFactor = 1
  locationType: "indoor",
  deliverables: "photos",
};

describe("generateQuote", () => {
  it("applies the event multiplier with no extra hours/location/deliverables", () => {
    // 20000 * 2.5 (wedding) * 1 * 1 (indoor) * 1 (photos) = 50000
    const q = generateQuote(baseAnswers, settings);
    expect(q.totalAmount).toBe(50000);
    expect(q.baseAmount).toBe(20000);
    expect(q.currencyCode).toBe("PKR");
  });

  it("adds 12% of base per extra hour and stacks location + deliverables", () => {
    // 20000 * 2.5 * (1 + 4*0.12=1.48) * 1.25 (both) * 1.7 (both deliverables)
    // = 157250 → nearest Rs 500 (314.5 rounds up) = 157500
    const q = generateQuote(
      { ...baseAnswers, durationHours: 6, locationType: "both", deliverables: "both" },
      settings
    );
    expect(q.totalAmount).toBe(157500);
  });

  it("sets expiry from quoteValidityHours", () => {
    const now = new Date("2026-06-30T00:00:00.000Z");
    const q = generateQuote(baseAnswers, settings, now);
    expect(q.expiresAt.toISOString()).toBe("2026-07-01T00:00:00.000Z");
  });

  it("never charges for fewer than the included hours", () => {
    const q = generateQuote({ ...baseAnswers, durationHours: 1 }, settings);
    // durationFactor clamps to 1 → same as 2h
    expect(q.totalAmount).toBe(50000);
  });
});

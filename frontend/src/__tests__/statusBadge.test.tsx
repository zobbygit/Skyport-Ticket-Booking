import { describe, it, expect } from "vitest";

// StatusBadge style mapping — tested in isolation without DOM
const STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  SCHEDULED: "bg-slate-100 text-slate-700",
  CHECK_IN_OPEN: "bg-blue-100 text-blue-700",
  BOARDING: "bg-emerald-100 text-emerald-700",
  DELAYED: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-red-100 text-red-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-emerald-100 text-emerald-700",
};

function getStatusStyle(status: string): string {
  return STYLES[status] || STYLES.SCHEDULED;
}

describe("StatusBadge styles", () => {
  it("PENDING_PAYMENT gets yellow", () => {
    expect(getStatusStyle("PENDING_PAYMENT")).toContain("yellow");
  });

  it("DELAYED gets orange", () => {
    expect(getStatusStyle("DELAYED")).toContain("orange");
  });

  it("CANCELLED gets red", () => {
    expect(getStatusStyle("CANCELLED")).toContain("red");
  });

  it("BOARDING gets emerald", () => {
    expect(getStatusStyle("BOARDING")).toContain("emerald");
  });

  it("unknown status falls back to SCHEDULED style", () => {
    expect(getStatusStyle("UNKNOWN_STATUS")).toContain("slate");
  });

  it("CHECKED_IN gets emerald", () => {
    expect(getStatusStyle("CHECKED_IN")).toContain("emerald");
  });
});
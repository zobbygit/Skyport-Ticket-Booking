import { describe, it, expect } from "vitest";

// usePrice hook logic — tested in isolation
function formatPrice(usdAmount: number, rate: number, symbol: string): string {
  const converted = usdAmount * rate;
  return `${symbol}${converted.toFixed(converted >= 100 ? 0 : 2)}`;
}

describe("Price formatting", () => {
  it("formats USD correctly", () => {
    expect(formatPrice(100, 1, "$")).toBe("$100");
  });

  it("formats small amounts with 2 decimals", () => {
    expect(formatPrice(9.99, 1, "$")).toBe("$9.99");
  });

  it("converts to EUR", () => {
    const result = formatPrice(100, 0.92, "€");
    expect(result).toBe("€92.00");
  });

  it("converts large amounts without decimals", () => {
    const result = formatPrice(200, 0.92, "€");
    expect(result).toBe("€184");
  });

  it("converts to INR", () => {
    const result = formatPrice(100, 83.5, "₹");
    expect(result).toContain("₹");
    expect(parseFloat(result.replace("₹", ""))).toBeGreaterThan(8000);
  });
});

// Password strength logic — tested in isolation
function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 8) return 0;
  let score = 0;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return 1;
  if (score <= 2) return 2;
  return 3;
}

describe("Password strength", () => {
  it("too short returns 0", () => {
    expect(passwordStrength("abc")).toBe(0);
  });

  it("weak password returns 1", () => {
    expect(passwordStrength("password")).toBe(1);
  });

  it("medium password returns 2", () => {
    expect(passwordStrength("Password1")).toBe(2);
  });

  it("strong password returns 3", () => {
    expect(passwordStrength("Password1!Extra")).toBe(3);
  });
});
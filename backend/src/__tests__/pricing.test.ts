import request from "supertest";
import app from "../app";

describe("Pricing API", () => {
  describe("GET /api/pricing/currencies", () => {
    it("returns supported currencies", async () => {
      const res = await request(app).get("/api/pricing/currencies");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const usd = res.body.data.find((c: any) => c.code === "USD");
      expect(usd).toBeDefined();
      expect(usd.symbol).toBe("$");
    });
  });

  describe("GET /api/pricing/convert", () => {
    it("converts USD to EUR", async () => {
      const res = await request(app).get("/api/pricing/convert?amount=100&from=USD&to=EUR");
      expect(res.status).toBe(200);
      expect(res.body.data.converted).toBeGreaterThan(0);
      expect(res.body.data.converted).toBeLessThan(100);
      expect(res.body.data.to).toBe("EUR");
    });

    it("same-currency conversion returns same amount", async () => {
      const res = await request(app).get("/api/pricing/convert?amount=200&from=USD&to=USD");
      expect(res.status).toBe(200);
      expect(res.body.data.converted).toBe(200);
    });

    it("rejects non-numeric amount", async () => {
      const res = await request(app).get("/api/pricing/convert?amount=abc&to=EUR");
      expect(res.status).toBe(400);
    });
  });
});
import request from "supertest";
import app from "../app";

describe("Flights API", () => {
  describe("GET /api/flights", () => {
    it("returns flight list", async () => {
      const res = await request(app).get("/api/flights");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("filters by origin", async () => {
      const res = await request(app).get("/api/flights?origin=JFK");
      expect(res.status).toBe(200);
      res.body.data.forEach((f: any) => {
        expect(f.origin_airport.iata_code).toBe("JFK");
      });
    });
  });

  describe("GET /api/flights/:id", () => {
    it("returns 404 for unknown id", async () => {
      const res = await request(app).get("/api/flights/00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/airports", () => {
    it("returns airports list", async () => {
      const res = await request(app).get("/api/airports");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /health", () => {
    it("health endpoint returns ok", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });
});
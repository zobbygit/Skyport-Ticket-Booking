import request from "supertest";
import app from "../app";

describe("Auth API", () => {
  const testEmail = `test_${Date.now()}@skyport-test.com`;
  const testPassword = "TestPassword123!";
  let accessToken: string;

  describe("POST /api/auth/register", () => {
    it("registers a new passenger", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Test Passenger",
        email: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.account.email).toBe(testEmail);
      expect(res.body.data.accessToken).toBeDefined();
      accessToken = res.body.data.accessToken;
    });

    it("rejects duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Dupe",
        email: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(409);
    });

    it("rejects missing password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Missing",
        email: "missing@test.com",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it("rejects wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "wrongpassword",
      });
      expect(res.status).toBe(401);
    });

    it("rejects unknown email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nobody@test.com",
        password: "anything",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns current user with valid token", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: testPassword,
      });
      const token = loginRes.body.data.accessToken;
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testEmail);
    });

    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });
});
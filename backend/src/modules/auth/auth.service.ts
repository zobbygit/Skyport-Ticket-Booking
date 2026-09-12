import { pool } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { comparePassword, hashPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { emailService } from "../../services/email/email.service";
import { auditService } from "../../services/audit/audit.service";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export const authService = {
  async registerPassenger(input: RegisterInput) {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [input.email.toLowerCase()]);
    if (existing.rowCount) throw ApiError.conflict("An account with this email already exists.");

    const passwordHash = await hashPassword(input.password);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, phone, avatar_url, role, created_at`,
      [input.fullName, input.email.toLowerCase(), passwordHash, input.phone || null]
    );
    const user = result.rows[0];

    emailService.sendWelcome(user.email, user.full_name).catch((e) => console.error("[email] welcome failed", e));

    auditService.log({
      actorType: "user",
      actorUserId: user.id,
      action: "PASSENGER_REGISTER",
      entityType: "user",
      entityId: user.id,
      metadata: { email: user.email, fullName: user.full_name },
    });

    return this.issueTokens(user.id, "passenger", "PASSENGER", user.email, user);
  },

  async loginPassenger(email: string, password: string) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !user.is_active) throw ApiError.unauthorized("Invalid email or password.");

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) throw ApiError.unauthorized("Invalid email or password.");

    auditService.log({
      actorType: "user",
      actorUserId: user.id,
      action: "PASSENGER_LOGIN",
      entityType: "user",
      entityId: user.id,
      metadata: { email: user.email },
    });

    return this.issueTokens(user.id, "passenger", user.role, user.email, user);
  },

  async loginAdmin(email: string, password: string) {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email.toLowerCase()]);
    const admin = result.rows[0];
    if (!admin || !admin.is_active) throw ApiError.unauthorized("Invalid email or password.");

    const valid = await comparePassword(password, admin.password_hash);
    if (!valid) throw ApiError.unauthorized("Invalid email or password.");

    auditService.log({
      actorType: "admin",
      actorAdminId: admin.id,
      action: "ADMIN_LOGIN",
      entityType: "admin",
      entityId: admin.id,
      metadata: { email: admin.email, role: admin.role },
    });

    return this.issueTokens(admin.id, "admin", admin.role, admin.email, admin);
  },

  async refresh(refreshToken: string, expectedAudience: "passenger" | "admin") {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Session expired. Please log in again.");
    }
    if (payload.audience !== expectedAudience) throw ApiError.unauthorized("Invalid session.");

    const table = expectedAudience === "passenger" ? "users" : "admins";
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [payload.sub]);
    const account = result.rows[0];
    if (!account || !account.is_active) throw ApiError.unauthorized("Account no longer active.");

    return this.issueTokens(account.id, expectedAudience, account.role, account.email, account);
  },

  issueTokens(id: string, audience: "passenger" | "admin", role: string, email: string, account: any) {
    const accessToken = signAccessToken({ sub: id, audience, role, email });
    const refreshToken = signRefreshToken({ sub: id, audience });
    return { accessToken, refreshToken, account: sanitizeAccount(account) };
  },
};

function sanitizeAccount(account: any) {
  if (!account) return account;
  const { password_hash, ...safe } = account;
  return safe;
}
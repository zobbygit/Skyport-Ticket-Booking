import { pool } from "../../config/db";
import { ApiError } from "../../utils/apiError";

export const usersService = {
  async getProfile(userId: string) {
    const result = await pool.query(
      "SELECT id, full_name, email, phone, avatar_url, role, created_at FROM users WHERE id = $1",
      [userId]
    );
    if (!result.rowCount) throw ApiError.notFound("User not found.");
    return result.rows[0];
  },

  async updateProfile(userId: string, data: { fullName?: string; phone?: string }) {
    const result = await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), updated_at = now()
       WHERE id = $3
       RETURNING id, full_name, email, phone, avatar_url, role`,
      [data.fullName || null, data.phone || null, userId]
    );
    return result.rows[0];
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    await pool.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [avatarUrl, userId]);
    return this.getProfile(userId);
  },

  async listSaved(userId: string) {
    const result = await pool.query(
      `SELECT si.*, row_to_json(oa.*) AS origin_airport, row_to_json(da.*) AS destination_airport
       FROM saved_items si
       LEFT JOIN airports oa ON oa.id = si.origin_airport_id
       LEFT JOIN airports da ON da.id = si.destination_airport_id
       WHERE si.user_id = $1 ORDER BY si.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async saveItem(userId: string, data: { itemType: string; originAirportId?: string; destinationAirportId?: string }) {
    const result = await pool.query(
      `INSERT INTO saved_items (user_id, item_type, origin_airport_id, destination_airport_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, data.itemType, data.originAirportId || null, data.destinationAirportId || null]
    );
    return result.rows[0];
  },

  async unsaveItem(userId: string, id: string) {
    await pool.query("DELETE FROM saved_items WHERE id = $1 AND user_id = $2", [id, userId]);
  },
};

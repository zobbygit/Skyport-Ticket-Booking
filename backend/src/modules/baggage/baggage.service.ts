import { pool } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { realtime } from "../../services/socket/socket";

const BAGGAGE_SELECT = `
  SELECT bg.*, row_to_json(b.*) AS booking
  FROM baggage bg
  JOIN bookings b ON b.id = bg.booking_id
`;

export const baggageService = {
  async getByTag(tagReference: string) {
    const result = await pool.query(`${BAGGAGE_SELECT} WHERE bg.tag_reference = $1`, [tagReference.toUpperCase()]);
    if (!result.rowCount) throw ApiError.notFound("Baggage tag not found.");
    return result.rows[0];
  },

  async listForUser(userId: string) {
    const result = await pool.query(
      `${BAGGAGE_SELECT} JOIN users u ON u.id = b.user_id WHERE u.id = $1 ORDER BY bg.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async updateStatus(baggageId: string, status: string, belt?: string, location?: string) {
    const result = await pool.query(
      `UPDATE baggage
       SET status = $1, belt = COALESCE($2, belt), last_scan_location = COALESCE($3, last_scan_location), last_scan_at = now()
       WHERE id = $4
       RETURNING *, booking_id`,
      [status, belt || null, location || null, baggageId]
    );
    if (!result.rowCount) throw ApiError.notFound("Baggage record not found.");

    const bag = result.rows[0];
    const userRes = await pool.query(
      "SELECT u.id AS user_id FROM bookings b JOIN users u ON u.id = b.user_id WHERE b.id = $1",
      [bag.booking_id]
    );
    if (userRes.rowCount) {
      realtime.baggageUpdated(userRes.rows[0].user_id, bag);
    }
    return bag;
  },

  async fileReport(baggageId: string, userId: string, description: string) {
    const result = await pool.query(
      `INSERT INTO baggage_reports (baggage_id, user_id, description) VALUES ($1, $2, $3) RETURNING *`,
      [baggageId, userId, description]
    );
    await pool.query("UPDATE baggage SET status = 'LOST' WHERE id = $1", [baggageId]);
    return result.rows[0];
  },
};

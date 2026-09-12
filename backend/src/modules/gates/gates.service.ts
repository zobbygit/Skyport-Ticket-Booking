import { pool } from "../../config/db";
import { ApiError } from "../../utils/apiError";

export const gatesService = {
  async listByTerminal(terminalId: string) {
    const result = await pool.query("SELECT * FROM gates WHERE terminal_id = $1 ORDER BY code", [terminalId]);
    return result.rows;
  },

  async updateStatus(gateId: string, status: string) {
    const result = await pool.query("UPDATE gates SET status = $1 WHERE id = $2 RETURNING *", [status, gateId]);
    if (!result.rowCount) throw ApiError.notFound("Gate not found.");
    return result.rows[0];
  },

  async create(terminalId: string, code: string) {
    const result = await pool.query(
      `INSERT INTO gates (terminal_id, code, status) VALUES ($1, $2, 'AVAILABLE')
       ON CONFLICT (terminal_id, code) DO UPDATE SET status = gates.status
       RETURNING *`,
      [terminalId, code]
    );
    return result.rows[0];
  },
};
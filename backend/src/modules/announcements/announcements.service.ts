import { pool } from "../../config/db";
import { realtime } from "../../services/socket/socket";

export const announcementsService = {
  async list(airportId?: string) {
    const conditions = airportId ? "WHERE airport_id = $1 OR airport_id IS NULL" : "";
    const values = airportId ? [airportId] : [];
    const result = await pool.query(
      `SELECT * FROM announcements ${conditions} ORDER BY created_at DESC LIMIT 50`,
      values
    );
    return result.rows;
  },

  async create(adminId: string, data: { airportId?: string; title: string; message: string; severity?: string }) {
    const result = await pool.query(
      `INSERT INTO announcements (airport_id, title, message, severity, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.airportId || null, data.title, data.message, data.severity || "INFO", adminId]
    );
    const announcement = result.rows[0];
    realtime.announcementCreated(data.airportId || null, announcement);
    return announcement;
  },

  async remove(id: string) {
  const result = await pool.query(
    `DELETE FROM announcements
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0] || null;
},


};


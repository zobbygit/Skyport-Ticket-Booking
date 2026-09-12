import { pool } from "../../config/db";
import { realtime } from "../../services/socket/socket";

export const notificationsService = {
  // ─── Passenger notifications ───────────────────────────────────────────────

  async listForUser(userId: string) {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100",
      [userId]
    );
    return result.rows;
  },

async create(
  userId: string,
  title: string,
  message: string,
  type = "GENERAL",
  relatedFlightId?: string,
  relatedBookingId?: string
) {
  const result = await pool.query(
    `INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_flight_id,
      related_booking_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      userId,
      title,
      message,
      type,
      relatedFlightId || null,
      relatedBookingId || null,
    ]
  );

  const notification = result.rows[0];
  realtime.notificationCreated(userId, notification);
  return notification;
},

  async markRead(id: string, userId: string) {
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2", [id, userId]);
  },

  async markAllRead(userId: string) {
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = $1", [userId]);
  },

  async unreadCount(userId: string) {
    const result = await pool.query(
      "SELECT count(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE",
      [userId]
    );
    return result.rows[0].count;
  },

  /** Notify every confirmed/checked-in passenger on a given flight. */
  async notifyFlightPassengers(
    flightId: string,
    title: string,
    message: string,
    type = "FLIGHT_UPDATE"
  ) {
    const result = await pool.query(
      `SELECT DISTINCT b.user_id FROM bookings b
       WHERE b.flight_id = $1 AND b.status IN ('CONFIRMED','CHECKED_IN')`,
      [flightId]
    );
    await Promise.all(
      result.rows.map((r: any) =>
        this.create(r.user_id, title, message, type, flightId)
      )
    );
  },

  // ─── Admin notifications ───────────────────────────────────────────────────

  async listAdminNotifications() {
    const result = await pool.query(
      "SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 100"
    );
    return result.rows;
  },

  async createAdminNotification(
    title: string,
    message: string,
    type = "GENERAL",
    relatedEntityId?: string,
    relatedEntityType?: string
  ) {
    const result = await pool.query(
      `INSERT INTO admin_notifications (title, message, type, related_entity_id, related_entity_type)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [title, message, type, relatedEntityId || null, relatedEntityType || null]
    );
    const notification = result.rows[0];
    // Broadcast to all connected admins via socket
    realtime.adminNotificationCreated(notification);
    return notification;
  },

  async markAdminRead(id: string) {
    await pool.query("UPDATE admin_notifications SET is_read = TRUE WHERE id = $1", [id]);
  },

  async markAllAdminRead() {
    await pool.query("UPDATE admin_notifications SET is_read = TRUE");
  },

  async unreadAdminCount() {
    const result = await pool.query(
      "SELECT count(*)::int AS count FROM admin_notifications WHERE is_read = FALSE"
    );
    return result.rows[0].count;
  },
};
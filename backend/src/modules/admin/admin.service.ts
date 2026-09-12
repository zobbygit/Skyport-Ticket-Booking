import { pool } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { hashPassword } from "../../utils/password";

export const adminService = {
  async dashboardStats() {
    const [flights, bookings, passengers, delayed] = await Promise.all([
      pool.query("SELECT count(*)::int AS count FROM flights WHERE departure_time::date = now()::date"),
      pool.query("SELECT count(*)::int AS count FROM bookings WHERE created_at::date = now()::date"),
      pool.query("SELECT count(*)::int AS count FROM users WHERE is_active = TRUE"),
      pool.query("SELECT count(*)::int AS count FROM flights WHERE status = 'DELAYED'"),
    ]);
    return {
      flightsToday: flights.rows[0].count,
      bookingsToday: bookings.rows[0].count,
      activePassengers: passengers.rows[0].count,
      delayedFlights: delayed.rows[0].count,
    };
  },

  async analytics() {
    const [bookingsPerDay, revenuePerDay, flightStatusBreakdown, topRoutes, recentActivity] =
      await Promise.all([
        pool.query(`
          SELECT date_trunc('day', b.created_at)::date AS date, count(*)::int AS bookings
          FROM bookings b
          WHERE b.created_at >= now() - interval '30 days' AND b.status != 'PENDING_PAYMENT'
          GROUP BY 1 ORDER BY 1
        `),
        pool.query(`
          SELECT date_trunc('day', p.created_at)::date AS date, ROUND(SUM(p.amount) / 100.0, 2) AS revenue
          FROM payments p
          WHERE p.status = 'succeeded' AND p.created_at >= now() - interval '30 days'
          GROUP BY 1 ORDER BY 1
        `),
        pool.query(`
          SELECT status, count(*)::int AS count
          FROM flights WHERE departure_time::date = now()::date
          GROUP BY status ORDER BY count DESC
        `),
        pool.query(`
          SELECT oa.iata_code AS origin, da.iata_code AS destination, count(*)::int AS bookings
          FROM bookings b
          JOIN flights f ON f.id = b.flight_id
          JOIN airports oa ON oa.id = f.origin_airport_id
          JOIN airports da ON da.id = f.destination_airport_id
          WHERE b.status IN ('CONFIRMED','CHECKED_IN','COMPLETED')
          GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 5
        `),
        pool.query(`
          SELECT
            (SELECT count(*)::int FROM users WHERE created_at >= now() - interval '7 days') AS new_passengers_week,
            (SELECT count(*)::int FROM bookings WHERE status IN ('CONFIRMED','CHECKED_IN') AND created_at >= now() - interval '7 days') AS bookings_week,
            (SELECT COALESCE(ROUND(SUM(amount)/100.0,2),0) FROM payments WHERE status='succeeded' AND created_at >= now() - interval '7 days') AS revenue_week,
            (SELECT count(*)::int FROM flights WHERE status = 'DELAYED') AS delayed_now,
            (SELECT count(*)::int FROM flights WHERE status = 'CANCELLED' AND departure_time::date = now()::date) AS cancelled_today
        `),
      ]);

    return {
      bookingsPerDay: bookingsPerDay.rows,
      revenuePerDay: revenuePerDay.rows,
      flightStatusBreakdown: flightStatusBreakdown.rows,
      topRoutes: topRoutes.rows,
      summary: recentActivity.rows[0],
    };
  },

  async listAdmins() {
    const result = await pool.query(
      "SELECT id, full_name, email, role, is_active, created_at FROM admins ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async createAdmin(creatorId: string, data: { fullName: string; email: string; password: string; role: string }) {
    const existing = await pool.query("SELECT id FROM admins WHERE email = $1", [data.email.toLowerCase()]);
    if (existing.rowCount) throw ApiError.conflict("An admin with this email already exists.");
    const hash = await hashPassword(data.password);
    const result = await pool.query(
      `INSERT INTO admins (full_name, email, password_hash, role, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, is_active, created_at`,
      [data.fullName, data.email.toLowerCase(), hash, data.role, creatorId]
    );
    await this.logAction(creatorId, "CREATE_ADMIN", "admin", result.rows[0].id, { email: data.email });
    return result.rows[0];
  },

  async setAdminActive(actorId: string, adminId: string, isActive: boolean) {
    const result = await pool.query(
      "UPDATE admins SET is_active = $1, updated_at = now() WHERE id = $2 RETURNING id, full_name, email, role, is_active",
      [isActive, adminId]
    );
    if (!result.rowCount) throw ApiError.notFound("Admin not found.");
    await this.logAction(actorId, isActive ? "REACTIVATE_ADMIN" : "DEACTIVATE_ADMIN", "admin", adminId, {});
    return result.rows[0];
  },

  async listPassengers(page = 1, pageSize = 20) {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, is_active, created_at FROM users
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [pageSize, (page - 1) * pageSize]
    );
    return result.rows;
  },

  async setPassengerActive(actorId: string, userId: string, isActive: boolean) {
    const result = await pool.query(
      "UPDATE users SET is_active = $1, updated_at = now() WHERE id = $2 RETURNING id, full_name, email, is_active",
      [isActive, userId]
    );
    if (!result.rowCount) throw ApiError.notFound("Passenger not found.");
    await this.logAction(actorId, isActive ? "REACTIVATE_PASSENGER" : "SUSPEND_PASSENGER", "user", userId, {});
    return result.rows[0];
  },

  async logAction(actorAdminId: string, action: string, entityType: string, entityId: string, metadata: object) {
    await pool.query(
      `INSERT INTO audit_logs (actor_admin_id, actor_type, action, entity_type, entity_id, metadata)
       VALUES ($1, 'admin', $2, $3, $4, $5)`,
      [actorAdminId, action, entityType, entityId, JSON.stringify(metadata)]
    );
  },

  async listAuditLogs(page = 1, pageSize = 50, actionFilter?: string) {
    const conditions: string[] = [];
    const values: any[] = [];
    if (actionFilter) {
      values.push(`%${actionFilter}%`);
      conditions.push(`al.action ILIKE $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    values.push(pageSize, (page - 1) * pageSize);
    const result = await pool.query(
      `SELECT al.*,
         CASE WHEN al.actor_type = 'admin' THEN row_to_json(a.*) ELSE NULL END AS actor_admin,
         CASE WHEN al.actor_type = 'user' THEN row_to_json(u.*) ELSE NULL END AS actor_user
       FROM audit_logs al
       LEFT JOIN admins a ON a.id = al.actor_admin_id
       LEFT JOIN users u ON u.id = al.actor_user_id
       ${where}
       ORDER BY al.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return result.rows.map((r: any) => {
      if (r.actor_admin) delete r.actor_admin.password_hash;
      if (r.actor_user) delete r.actor_user.password_hash;
      return r;
    });
  },

  async getAllAuditLogs(actionFilter?: string) {
    const conditions: string[] = [];
    const values: any[] = [];
    if (actionFilter) {
      values.push(`%${actionFilter}%`);
      conditions.push(`al.action ILIKE $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT al.*,
         CASE WHEN al.actor_type = 'admin' THEN row_to_json(a.*) ELSE NULL END AS actor_admin,
         CASE WHEN al.actor_type = 'user' THEN row_to_json(u.*) ELSE NULL END AS actor_user
       FROM audit_logs al
       LEFT JOIN admins a ON a.id = al.actor_admin_id
       LEFT JOIN users u ON u.id = al.actor_user_id
       ${where}
       ORDER BY al.created_at DESC LIMIT 5000`,
      values
    );
    return result.rows.map((r: any) => {
      if (r.actor_admin) delete r.actor_admin.password_hash;
      if (r.actor_user) delete r.actor_user.password_hash;
      return r;
    });
  },
};
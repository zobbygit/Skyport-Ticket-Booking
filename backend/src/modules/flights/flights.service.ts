import { pool } from "../../config/db";
import { cache } from "../../services/cache/cache.service";
import { ApiError } from "../../utils/apiError";
import { realtime } from "../../services/socket/socket";
import { auditService } from "../../services/audit/audit.service";
import { notificationsService } from "../notifications/notifications.service";

export interface FlightSearchParams {
  origin?: string;   // IATA code
  destination?: string;
  date?: string;     // YYYY-MM-DD
  airline?: string;
  page?: number;
  pageSize?: number;
}

const FLIGHT_SELECT = `
  SELECT f.*,
    row_to_json(oa.*) AS origin_airport,
    row_to_json(da.*) AS destination_airport,
    row_to_json(t.*) AS terminal,
    row_to_json(g.*) AS gate
  FROM flights f
  JOIN airports oa ON oa.id = f.origin_airport_id
  JOIN airports da ON da.id = f.destination_airport_id
  LEFT JOIN terminals t ON t.id = f.terminal_id
  LEFT JOIN gates g ON g.id = f.gate_id
`;

export const flightsService = {
  async search(params: FlightSearchParams) {
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.origin) {
    values.push(params.origin.toUpperCase());
    conditions.push(`oa.iata_code = $${values.length}`);
  }

  if (params.destination) {
    values.push(params.destination.toUpperCase());
    conditions.push(`da.iata_code = $${values.length}`);
  }

  if (params.date) {
    values.push(params.date);
    conditions.push(`f.departure_time::date = $${values.length}::date`);
  }

  if (params.airline) {
    values.push(`%${params.airline}%`);
    conditions.push(`f.airline ILIKE $${values.length}`);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const sql = `
    ${FLIGHT_SELECT}
    ${where}
    ORDER BY f.departure_time ASC
  `;

  const result = await pool.query(sql, values);

  return result.rows;
},

  async getById(id: string) {
    const cacheKey = `flight:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const result = await pool.query(`${FLIGHT_SELECT} WHERE f.id = $1`, [id]);
    if (!result.rowCount) throw ApiError.notFound("Flight not found.");
    cache.set(cacheKey, result.rows[0], 15);
    return result.rows[0];
  },

  async getByNumber(flightNumber: string) {
    const result = await pool.query(`${FLIGHT_SELECT} WHERE f.flight_number = $1 ORDER BY f.departure_time DESC LIMIT 1`, [flightNumber.toUpperCase()]);
    if (!result.rowCount) throw ApiError.notFound("Flight not found.");
    return result.rows[0];
  },

  async updateStatus(flightId: string, status: string, adminId: string) {
    const current = await pool.query("SELECT status FROM flights WHERE id = $1", [flightId]);
    if (!current.rowCount) throw ApiError.notFound("Flight not found.");

    await pool.query("UPDATE flights SET status = $1, updated_at = now() WHERE id = $2", [status, flightId]);
    await pool.query(
      `INSERT INTO flight_events (flight_id, event_type, old_value, new_value, created_by)
       VALUES ($1, 'STATUS_CHANGE', $2, $3, $4)`,
      [flightId, current.rows[0].status, status, adminId]
    );
    cache.del(`flight:${flightId}`);
    auditService.log({ actorType: "admin", actorAdminId: adminId, action: "FLIGHT_STATUS_CHANGED", entityType: "flight", entityId: flightId, metadata: { from: current.rows[0].status, to: status } });
    const updated = await this.getById(flightId);
    realtime.flightUpdated(flightId, updated);

    // Build a human message that varies by status
    const route = `${updated.origin_airport.iata_code} → ${updated.destination_airport.iata_code}`;
    const statusMessages: Record<string, { title: string; message: string }> = {
      DELAYED:        { title: `⚠️ Delay — ${updated.flight_number}`, message: `Your flight ${updated.flight_number} (${route}) is delayed. Check the app for the latest departure time.` },
      GATE_CHANGED:   { title: `🚪 Gate change — ${updated.flight_number}`, message: `Gate has changed for ${updated.flight_number} (${route}). New gate: ${updated.gate?.code || "TBD"}.` },
      BOARDING:       { title: `🛫 Now boarding — ${updated.flight_number}`, message: `Boarding has started for ${updated.flight_number} (${route}). Please proceed to gate ${updated.gate?.code || "TBD"}.` },
      CHECK_IN_OPEN:  { title: `✅ Check-in open — ${updated.flight_number}`, message: `Check-in is now open for ${updated.flight_number} (${route}). Check in from your dashboard.` },
      CANCELLED:      { title: `❌ Cancelled — ${updated.flight_number}`, message: `We're sorry — flight ${updated.flight_number} (${route}) has been cancelled. Please contact support.` },
      DEPARTED:       { title: `✈️ Departed — ${updated.flight_number}`, message: `Flight ${updated.flight_number} has departed. Safe travels!` },
      LANDED:         { title: `🛬 Landed — ${updated.flight_number}`, message: `Flight ${updated.flight_number} has landed at ${updated.destination_airport.city}. Welcome!` },
    };
    const notif = statusMessages[status] || {
      title: `Flight ${updated.flight_number} update`,
      message: `Your flight ${updated.flight_number} (${route}) status is now: ${status.replace(/_/g, " ")}`,
    };

    notificationsService.notifyFlightPassengers(flightId, notif.title, notif.message, "FLIGHT_UPDATE");

    return updated;
  },

  async updateGate(flightId: string, gateId: string, adminId: string) {
    const current = await pool.query("SELECT gate_id FROM flights WHERE id = $1", [flightId]);
    if (!current.rowCount) throw ApiError.notFound("Flight not found.");

    await pool.query("UPDATE flights SET gate_id = $1, status = 'GATE_CHANGED', updated_at = now() WHERE id = $2", [gateId, flightId]);
    await pool.query(
      `INSERT INTO flight_events (flight_id, event_type, old_value, new_value, created_by)
       VALUES ($1, 'GATE_CHANGE', $2, $3, $4)`,
      [flightId, current.rows[0].gate_id, gateId, adminId]
    );
    cache.del(`flight:${flightId}`);
    auditService.log({ actorType: "admin", actorAdminId: adminId, action: "FLIGHT_GATE_CHANGED", entityType: "flight", entityId: flightId, metadata: { newGateId: gateId } });
    const updated = await this.getById(flightId);
    realtime.flightUpdated(flightId, updated);

    // Notify all passengers on this flight
    notificationsService.notifyFlightPassengers(
      flightId,
      `Gate change — ${updated.flight_number} ⚠️`,
      `Your flight ${updated.flight_number} has a new gate: ${updated.gate?.code || "TBD"}. Please proceed to the updated gate.`,
      "GATE_CHANGE"
    );

    return updated;
  },

  async create(data: Record<string, any>, adminId?: string) {
    const cols = [
      "flight_number", "airline", "aircraft", "origin_airport_id", "destination_airport_id",
      "departure_time", "arrival_time", "terminal_id", "gate_id", "boarding_time", "base_price", "seats_available",
    ];
    const values = cols.map((c) => data[c] ?? null);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const result = await pool.query(
      `INSERT INTO flights (${cols.join(", ")}) VALUES (${placeholders}) RETURNING id`,
      values
    );
    const flight = await this.getById(result.rows[0].id);
    auditService.log({
      actorType: "admin", actorAdminId: adminId || null, action: "FLIGHT_CREATED", entityType: "flight",
      entityId: flight.id,
      metadata: { flightNumber: flight.flight_number, airline: flight.airline, route: `${flight.origin_airport.iata_code} → ${flight.destination_airport.iata_code}` },
    });
    return flight;
  },

  async listEvents(flightId: string) {
    const result = await pool.query(
      "SELECT * FROM flight_events WHERE flight_id = $1 ORDER BY created_at DESC LIMIT 50",
      [flightId]
    );
    return result.rows;
  },
};
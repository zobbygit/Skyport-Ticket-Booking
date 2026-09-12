import { pool } from "../../config/db";
import { cache } from "../../services/cache/cache.service";
import { ApiError } from "../../utils/apiError";
import { auditService } from "../../services/audit/audit.service";

export const airportsService = {
  async list() {
    const cached = cache.get("airports:all");
    if (cached) return cached;
    const result = await pool.query("SELECT * FROM airports ORDER BY name ASC");
    cache.set("airports:all", result.rows, 300);
    return result.rows;
  },

  async getByIata(iata: string) {
    const result = await pool.query("SELECT * FROM airports WHERE iata_code = $1", [iata.toUpperCase()]);
    if (!result.rowCount) throw ApiError.notFound("Airport not found.");
    return result.rows[0];
  },

  async getMapPoints(airportId: string, terminalId?: string) {
    const conditions = terminalId ? "WHERE airport_id = $1 AND terminal_id = $2" : "WHERE airport_id = $1";
    const values = terminalId ? [airportId, terminalId] : [airportId];
    const result = await pool.query(`SELECT * FROM map_points ${conditions} ORDER BY type`, values);
    return result.rows;
  },

  async getTerminals(airportId: string) {
    const result = await pool.query("SELECT * FROM terminals WHERE airport_id = $1 ORDER BY code", [airportId]);
    return result.rows;
  },

  async create(data: {
    iataCode: string; name: string; city: string; country: string; timezone?: string;
    latitude?: number; longitude?: number; facilities?: string[]; transportation?: string[];
    adminId?: string;
  }) {
    const existing = await pool.query("SELECT id FROM airports WHERE iata_code = $1", [data.iataCode.toUpperCase()]);
    if (existing.rowCount) throw ApiError.conflict("An airport with this IATA code already exists.");

    const result = await pool.query(
      `INSERT INTO airports (iata_code, name, city, country, timezone, latitude, longitude, facilities, transportation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.iataCode.toUpperCase(), data.name, data.city, data.country, data.timezone || "UTC",
        data.latitude ?? null, data.longitude ?? null,
        JSON.stringify(data.facilities || []), JSON.stringify(data.transportation || []),
      ]
    );
    cache.delPrefix("airports:");
    auditService.log({ actorType: "admin", actorAdminId: data.adminId || null, action: "AIRPORT_CREATED", entityType: "airport", entityId: result.rows[0].id, metadata: { iataCode: data.iataCode, name: data.name, city: data.city } });
    return result.rows[0];
  },

  async createTerminal(airportId: string, data: { code: string; name: string; adminId?: string }) {
    const result = await pool.query(
      `INSERT INTO terminals (airport_id, code, name) VALUES ($1,$2,$3)
       ON CONFLICT (airport_id, code) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [airportId, data.code, data.name]
    );
    auditService.log({ actorType: "admin", actorAdminId: data.adminId || null, action: "TERMINAL_CREATED", entityType: "terminal", entityId: result.rows[0].id, metadata: { code: data.code, name: data.name } });
    return result.rows[0];
  },

  async createMapPoint(airportId: string, data: { terminalId?: string; type: string; label: string; x: number; y: number }) {
    const result = await pool.query(
      `INSERT INTO map_points (airport_id, terminal_id, type, label, x, y)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [airportId, data.terminalId || null, data.type, data.label, data.x, data.y]
    );
    return result.rows[0];
  },

  async deleteMapPoint(id: string) {
    await pool.query("DELETE FROM map_points WHERE id = $1", [id]);
  },
};
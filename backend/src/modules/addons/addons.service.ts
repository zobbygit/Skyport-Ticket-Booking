import { pool } from "../../config/db";
import { ApiError } from "../../utils/apiError";

export const ADDON_CATALOG = [
  { type: "EXTRA_BAGGAGE", label: "Extra checked bag (23kg)", price_usd: 45 },
  { type: "EXTRA_BAGGAGE_HEAVY", label: "Heavy bag allowance (32kg)", price_usd: 65 },
  { type: "PRIORITY_BOARDING", label: "Priority boarding", price_usd: 15 },
  { type: "LOUNGE_ACCESS", label: "Airport lounge access", price_usd: 35 },
  { type: "SEAT_UPGRADE", label: "Cabin upgrade (next class)", price_usd: 120 },
  { type: "MEAL_PREMIUM", label: "Premium meal selection", price_usd: 22 },
];

export const addonsService = {
  catalog() {
    return ADDON_CATALOG;
  },

  async listForBooking(bookingId: string) {
    const res = await pool.query(
      "SELECT * FROM booking_addons WHERE booking_id = $1 ORDER BY created_at",
      [bookingId]
    );
    return res.rows;
  },

  async add(bookingId: string, userId: string, type: string) {
    // Verify booking belongs to user
    const bRes = await pool.query("SELECT id, status FROM bookings WHERE id = $1 AND user_id = $2", [bookingId, userId]);
    if (!bRes.rowCount) throw ApiError.notFound("Booking not found.");
    if (bRes.rows[0].status === "CANCELLED") throw ApiError.badRequest("Cannot add extras to a cancelled booking.");

    const addon = ADDON_CATALOG.find((a) => a.type === type);
    if (!addon) throw ApiError.badRequest("Unknown add-on type.");

    const res = await pool.query(
      `INSERT INTO booking_addons (booking_id, type, label, price_usd)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [bookingId, addon.type, addon.label, addon.price_usd]
    );
    return res.rows[0];
  },

  async remove(addonId: string, userId: string) {
    const res = await pool.query(
      `DELETE FROM booking_addons ba
       USING bookings b
       WHERE ba.booking_id = b.id AND b.user_id = $1 AND ba.id = $2
       RETURNING ba.id`,
      [userId, addonId]
    );
    if (!res.rowCount) throw ApiError.notFound("Add-on not found.");
  },
};
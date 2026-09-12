import { pool, withTransaction } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { generateBaggageTag, generateBookingReference } from "../../utils/ids";
import { emailService } from "../../services/email/email.service";
import { generateTicketPdf } from "../../services/pdf/ticket-pdf.service";
import { flightsService } from "../flights/flights.service";
import { auditService } from "../../services/audit/audit.service";
import { notificationsService } from "../notifications/notifications.service";

const BOOKING_SELECT = `
  SELECT b.*,
    jsonb_build_object(
      'id', f.id,
      'flight_number', f.flight_number,
      'airline', f.airline,
      'aircraft', f.aircraft,
      'departure_time', f.departure_time,
      'arrival_time', f.arrival_time,
      'boarding_time', f.boarding_time,
      'status', f.status,
      'base_price', f.base_price,
      'origin_airport_id', f.origin_airport_id,
      'destination_airport_id', f.destination_airport_id,
      'origin_airport', row_to_json(oa.*),
      'destination_airport', row_to_json(da.*),
      'terminal', row_to_json(t.*),
      'gate', row_to_json(g.*)
    ) AS flight
  FROM bookings b
  JOIN flights f ON f.id = b.flight_id
  JOIN airports oa ON oa.id = f.origin_airport_id
  JOIN airports da ON da.id = f.destination_airport_id
  LEFT JOIN terminals t ON t.id = f.terminal_id
  LEFT JOIN gates g ON g.id = f.gate_id
`;

export const bookingsService = {
  async create(userId: string, input: { flightId: string; cabinClass: string; passengerCount?: number }) {
    const flight = await flightsService.getById(input.flightId);
    if (flight.seats_available < (input.passengerCount || 1)) {
      throw ApiError.conflict("Not enough seats available on this flight.");
    }

    const booking = await withTransaction(async (client) => {
      const reference = generateBookingReference();
      const result = await client.query(
        `INSERT INTO bookings (booking_reference, user_id, flight_id, cabin_class, passenger_count, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING_PAYMENT') RETURNING *`,
        [reference, userId, input.flightId, input.cabinClass, input.passengerCount || 1]
      );
      await client.query(
        "UPDATE flights SET seats_available = seats_available - $1 WHERE id = $2",
        [input.passengerCount || 1, input.flightId]
      );
      return result.rows[0];
    });

    auditService.log({
      actorType: "user",
      actorUserId: userId,
      action: "BOOKING_CREATED",
      entityType: "booking",
      entityId: booking.id,
      metadata: {
        bookingReference: booking.booking_reference,
        flightNumber: flight.flight_number,
        cabinClass: input.cabinClass,
        route: `${flight.origin_airport.iata_code} → ${flight.destination_airport.iata_code}`,
        status: "PENDING_PAYMENT",
      },
    });

    // Notify passenger to complete payment
    notificationsService.create(
      userId,
      "Complete your booking 💳",
      `Your booking for ${flight.flight_number} is reserved. Complete payment to confirm your seat. Ref: ${booking.booking_reference}`,
      "PAYMENT_PENDING",
      flight.id,
      booking.id
    );

    return { ...booking, flight };
  },

  async listForUser(userId: string) {
    const result = await pool.query(`${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY f.departure_time DESC`, [userId]);
    return result.rows;
  },

  async getById(id: string, userId?: string) {
    const conditions = userId ? "WHERE b.id = $1 AND b.user_id = $2" : "WHERE b.id = $1";
    const values = userId ? [id, userId] : [id];
    const result = await pool.query(`${BOOKING_SELECT} ${conditions}`, values);
    if (!result.rowCount) throw ApiError.notFound("Booking not found.");
    return result.rows[0];
  },

  async checkIn(bookingId: string, userId: string, seat?: string) {
    const booking = await this.getById(bookingId, userId);
    if (booking.status !== "CONFIRMED") throw ApiError.badRequest("Only confirmed bookings can be checked in.");

    const boardingGroup = ["A", "B", "C"][Math.floor(Math.random() * 3)];
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE bookings SET status = 'CHECKED_IN', checked_in_at = now(),
         seat = COALESCE($1, seat), boarding_group = $2 WHERE id = $3`,
        [seat || null, boardingGroup, bookingId]
      );
      await client.query(
        `INSERT INTO baggage (booking_id, tag_reference, status) VALUES ($1, $2, 'CHECKED_IN')`,
        [bookingId, generateBaggageTag()]
      );
    });

    const updated = await this.getById(bookingId, userId);

    auditService.log({
      actorType: "user",
      actorUserId: userId,
      action: "BOARDING_PASS_GENERATED",
      entityType: "booking",
      entityId: bookingId,
      metadata: {
        bookingReference: updated.booking_reference,
        flightNumber: updated.flight.flight_number,
        seat: updated.seat,
        boardingGroup: updated.boarding_group,
      },
    });

    // Passenger notification — deep link to boarding pass
    notificationsService.create(
      userId,
      "Boarding pass ready 🎫",
      `You're checked in for ${updated.flight.flight_number}! Tap to view your boarding pass. Gate: ${updated.flight.gate?.code || "TBD"} · Group ${updated.boarding_group || "—"}`,
      "BOARDING_PASS",
      updated.flight.id,
        bookingId
    );

    // Admin notification
    notificationsService.createAdminNotification(
      "Passenger checked in",
      `A passenger checked in for ${updated.flight.flight_number} — Ref: ${updated.booking_reference}`,
      "CHECK_IN",
      bookingId,
      "booking"
    );

    // (async () => {
    //   try {
    //     const userRes = await pool.query("SELECT full_name, email FROM users WHERE id = $1", [userId]);
    //     const user = userRes.rows[0];
    //     const f = updated.flight;
    //     const pdf = await generateTicketPdf({
    //       passengerName: user.full_name,
    //       bookingReference: updated.booking_reference,
    //       flightNumber: f.flight_number,
    //       originCode: f.origin_airport.iata_code,
    //       originCity: f.origin_airport.city,
    //       destinationCode: f.destination_airport.iata_code,
    //       destinationCity: f.destination_airport.city,
    //       departureTime: f.departure_time,
    //       gate: f.gate?.code,
    //       seat: updated.seat,
    //       boardingGroup: updated.boarding_group,
    //       cabinClass: updated.cabin_class,
    //     });
    //     await emailService.sendBoardingPass(
    //       user.email,
    //       {
    //         passengerName: user.full_name,
    //         flightNumber: f.flight_number,
    //         origin: f.origin_airport.iata_code,
    //         destination: f.destination_airport.iata_code,
    //         departureTime: new Date(f.departure_time).toUTCString(),
    //         bookingReference: updated.booking_reference,
    //       },
    //       pdf
    //     );
    //   } catch (e) {
    //     console.error("[email] boarding pass email failed", e);
    //   }
    // })();

    return updated;
  },

  async cancel(bookingId: string, userId: string) {
    const booking = await this.getById(bookingId, userId);
    if (booking.status === "CANCELLED") throw ApiError.badRequest("Booking already cancelled.");

    await withTransaction(async (client) => {
      await client.query("UPDATE bookings SET status = 'CANCELLED', cancelled_at = now() WHERE id = $1", [bookingId]);
      await client.query(
        "UPDATE flights SET seats_available = seats_available + $1 WHERE id = $2",
        [booking.passenger_count, booking.flight_id]
      );
    });

    auditService.log({
      actorType: "user",
      actorUserId: userId,
      action: "BOOKING_CANCELLED",
      entityType: "booking",
      entityId: bookingId,
      metadata: {
        bookingReference: booking.booking_reference,
        flightNumber: booking.flight.flight_number,
      },
    });

    notificationsService.create(
      userId,
      "Booking cancelled",
      `Your booking ${booking.booking_reference} for ${booking.flight.flight_number} has been cancelled.`,
      "BOOKING_CANCELLED",
      booking.flight.id,
        booking.id
    );

    const userRes = await pool.query("SELECT full_name, email FROM users WHERE id = $1", [userId]);
    const user = userRes.rows[0];
    emailService.sendBookingCancellation(user.email, {
      passengerName: user.full_name,
      flightNumber: booking.flight.flight_number,
      origin: booking.flight.origin_airport.iata_code,
      destination: booking.flight.destination_airport.iata_code,
      departureTime: new Date(booking.flight.departure_time).toUTCString(),
      bookingReference: booking.booking_reference,
    }).catch((e) => console.error("[email] cancellation failed", e));

    return this.getById(bookingId, userId);
  },
};
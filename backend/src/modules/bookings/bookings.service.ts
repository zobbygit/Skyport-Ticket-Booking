// import { pool, withTransaction } from "../../config/db";
// import { ApiError } from "../../utils/apiError";
// import { generateBaggageTag, generateBookingReference } from "../../utils/ids";
// import { emailService } from "../../services/email/email.service";
// import { generateTicketPdf } from "../../services/pdf/ticket-pdf.service";
// import { flightsService } from "../flights/flights.service";
// import { auditService } from "../../services/audit/audit.service";
// import { notificationsService } from "../notifications/notifications.service";

// const BOOKING_SELECT = `
//   SELECT b.*,
//     jsonb_build_object(
//       'id', f.id,
//       'flight_number', f.flight_number,
//       'airline', f.airline,
//       'aircraft', f.aircraft,
//       'departure_time', f.departure_time,
//       'arrival_time', f.arrival_time,
//       'boarding_time', f.boarding_time,
//       'status', f.status,
//       'base_price', f.base_price,
//       'origin_airport_id', f.origin_airport_id,
//       'destination_airport_id', f.destination_airport_id,
//       'origin_airport', row_to_json(oa.*),
//       'destination_airport', row_to_json(da.*),
//       'terminal', row_to_json(t.*),
//       'gate', row_to_json(g.*)
//     ) AS flight
//   FROM bookings b
//   JOIN flights f ON f.id = b.flight_id
//   JOIN airports oa ON oa.id = f.origin_airport_id
//   JOIN airports da ON da.id = f.destination_airport_id
//   LEFT JOIN terminals t ON t.id = f.terminal_id
//   LEFT JOIN gates g ON g.id = f.gate_id
// `;

// export const bookingsService = {
//   async create(userId: string, input: { flightId: string; cabinClass: string; passengerCount?: number }) {
//     const flight = await flightsService.getById(input.flightId);
//     if (flight.seats_available < (input.passengerCount || 1)) {
//       throw ApiError.conflict("Not enough seats available on this flight.");
//     }

//     const booking = await withTransaction(async (client) => {
//       const reference = generateBookingReference();
//       const result = await client.query(
//         `INSERT INTO bookings (booking_reference, user_id, flight_id, cabin_class, passenger_count, status)
//          VALUES ($1, $2, $3, $4, $5, 'PENDING_PAYMENT') RETURNING *`,
//         [reference, userId, input.flightId, input.cabinClass, input.passengerCount || 1]
//       );
//       await client.query(
//         "UPDATE flights SET seats_available = seats_available - $1 WHERE id = $2",
//         [input.passengerCount || 1, input.flightId]
//       );
//       return result.rows[0];
//     });

//     auditService.log({
//       actorType: "user",
//       actorUserId: userId,
//       action: "BOOKING_CREATED",
//       entityType: "booking",
//       entityId: booking.id,
//       metadata: {
//         bookingReference: booking.booking_reference,
//         flightNumber: flight.flight_number,
//         cabinClass: input.cabinClass,
//         route: `${flight.origin_airport.iata_code} → ${flight.destination_airport.iata_code}`,
//         status: "PENDING_PAYMENT",
//       },
//     });

//     // Notify passenger to complete payment
//     notificationsService.create(
//       userId,
//       "Complete your booking 💳",
//       `Your booking for ${flight.flight_number} is reserved. Complete payment to confirm your seat. Ref: ${booking.booking_reference}`,
//       "PAYMENT_PENDING",
//       flight.id,
//       booking.id
//     );

//     return { ...booking, flight };
//   },

//   async listForUser(userId: string) {
//     const result = await pool.query(`${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY f.departure_time DESC`, [userId]);
//     return result.rows;
//   },

//   async getById(id: string, userId?: string) {
//     const conditions = userId ? "WHERE b.id = $1 AND b.user_id = $2" : "WHERE b.id = $1";
//     const values = userId ? [id, userId] : [id];
//     const result = await pool.query(`${BOOKING_SELECT} ${conditions}`, values);
//     if (!result.rowCount) throw ApiError.notFound("Booking not found.");
//     return result.rows[0];
//   },

//   async checkIn(bookingId: string, userId: string, seat?: string) {
//     const booking = await this.getById(bookingId, userId);
//     if (booking.status !== "CONFIRMED") throw ApiError.badRequest("Only confirmed bookings can be checked in.");

//     const boardingGroup = ["A", "B", "C"][Math.floor(Math.random() * 3)];
//     await withTransaction(async (client) => {
//       await client.query(
//         `UPDATE bookings SET status = 'CHECKED_IN', checked_in_at = now(),
//          seat = COALESCE($1, seat), boarding_group = $2 WHERE id = $3`,
//         [seat || null, boardingGroup, bookingId]
//       );
//       await client.query(
//         `INSERT INTO baggage (booking_id, tag_reference, status) VALUES ($1, $2, 'CHECKED_IN')`,
//         [bookingId, generateBaggageTag()]
//       );
//     });

//     const updated = await this.getById(bookingId, userId);

//     auditService.log({
//       actorType: "user",
//       actorUserId: userId,
//       action: "BOARDING_PASS_GENERATED",
//       entityType: "booking",
//       entityId: bookingId,
//       metadata: {
//         bookingReference: updated.booking_reference,
//         flightNumber: updated.flight.flight_number,
//         seat: updated.seat,
//         boardingGroup: updated.boarding_group,
//       },
//     });

//     // Passenger notification — deep link to boarding pass
//     notificationsService.create(
//       userId,
//       "Boarding pass ready 🎫",
//       `You're checked in for ${updated.flight.flight_number}! Tap to view your boarding pass. Gate: ${updated.flight.gate?.code || "TBD"} · Group ${updated.boarding_group || "—"}`,
//       "BOARDING_PASS",
//       updated.flight.id,
//         bookingId
//     );

//     // Admin notification
//     notificationsService.createAdminNotification(
//       "Passenger checked in",
//       `A passenger checked in for ${updated.flight.flight_number} — Ref: ${updated.booking_reference}`,
//       "CHECK_IN",
//       bookingId,
//       "booking"
//     );

 

//     return updated;
//   },

//   async cancel(bookingId: string, userId: string) {
//     const booking = await this.getById(bookingId, userId);
//     if (booking.status === "CANCELLED") throw ApiError.badRequest("Booking already cancelled.");

//     await withTransaction(async (client) => {
//       await client.query("UPDATE bookings SET status = 'CANCELLED', cancelled_at = now() WHERE id = $1", [bookingId]);
//       await client.query(
//         "UPDATE flights SET seats_available = seats_available + $1 WHERE id = $2",
//         [booking.passenger_count, booking.flight_id]
//       );
//     });

//     auditService.log({
//       actorType: "user",
//       actorUserId: userId,
//       action: "BOOKING_CANCELLED",
//       entityType: "booking",
//       entityId: bookingId,
//       metadata: {
//         bookingReference: booking.booking_reference,
//         flightNumber: booking.flight.flight_number,
//       },
//     });

//     notificationsService.create(
//       userId,
//       "Booking cancelled",
//       `Your booking ${booking.booking_reference} for ${booking.flight.flight_number} has been cancelled.`,
//       "BOOKING_CANCELLED",
//       booking.flight.id,
//         booking.id
//     );

//     const userRes = await pool.query("SELECT full_name, email FROM users WHERE id = $1", [userId]);
//     const user = userRes.rows[0];
//     emailService.sendBookingCancellation(user.email, {
//       passengerName: user.full_name,
//       flightNumber: booking.flight.flight_number,
//       origin: booking.flight.origin_airport.iata_code,
//       destination: booking.flight.destination_airport.iata_code,
//       departureTime: new Date(booking.flight.departure_time).toUTCString(),
//       bookingReference: booking.booking_reference,
//     }).catch((e) => console.error("[email] cancellation failed", e));

//     return this.getById(bookingId, userId);
//   },
// };





import { pool, withTransaction } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { generateBaggageTag, generateBookingReference } from "../../utils/ids";
import { emailService } from "../../services/email/email.service";
import { generateTicketPdf } from "../../services/pdf/ticket-pdf.service";
import { flightsService } from "../flights/flights.service";
import { auditService } from "../../services/audit/audit.service";
import { notificationsService } from "../notifications/notifications.service";

export interface PassengerInput {
  fullName: string;
  passportNumber?: string;
  dateOfBirth?: string;
  seat?: string;
}

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

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

async function getPassengers(bookingId: string) {
  const res = await pool.query(
    "SELECT * FROM booking_passengers WHERE booking_id = $1 ORDER BY created_at",
    [bookingId]
  );
  return res.rows;
}

/**
 * Batch-load passengers for many bookings at once — avoids the N+1 problem.
 * Returns a Map<bookingId, passenger[]>.
 */
async function getPassengersForBookings(bookingIds: string[]) {
  const map = new Map<string, any[]>();
  if (!bookingIds.length) return map;

  const res = await pool.query(
    `SELECT * FROM booking_passengers
     WHERE booking_id = ANY($1::uuid[])
     ORDER BY created_at`,
    [bookingIds]
  );

  for (const row of res.rows) {
    if (!map.has(row.booking_id)) map.set(row.booking_id, []);
    map.get(row.booking_id)!.push(row);
  }
  return map;
}

/** Assign a boarding group round-robin across passengers. */
function assignBoardingGroup(index: number): string {
  return ["A", "B", "C"][index % 3];
}

/**
 * Generate a seat number for a passenger.
 * Real implementations should query a seat map; this is a deterministic fallback.
 */
async function assignSeat(
  client: any,
  flightId: string,
  index: number
): Promise<string> {
  const letters = ["A", "B", "C", "D", "E", "F"];

  // Get every seat already assigned on this flight
  const result = await client.query(
    `SELECT seat
     FROM booking_passengers
     WHERE flight_id = $1
       AND seat IS NOT NULL`,
    [flightId]
  );

  const occupiedSeats = new Set(
    result.rows.map((row: { seat: string }) => row.seat)
  );

  // Find the first available seat
  for (let row = 1; row <= 100; row++) {
    for (const letter of letters) {
      const seat = `${row}${letter}`;

      if (!occupiedSeats.has(seat)) {
        occupiedSeats.add(seat);
        return seat;
      }
    }
  }

  throw ApiError.conflict("No seats available on this flight.");
}
/* ------------------------------------------------------------------ */
/* Service                                                             */
/* ------------------------------------------------------------------ */

export const bookingsService = {
  /* ---------------------------------------------------------------- */
  /* Create                                                            */
  /* ---------------------------------------------------------------- */
  async create(
    userId: string,
    input: {
      flightId: string;
      cabinClass: string;
      passengers?: PassengerInput[];
    }
  ) {
    const flight = await flightsService.getById(input.flightId);

    const passengers: PassengerInput[] = input.passengers?.length
      ? input.passengers
      : [{ fullName: "Primary Passenger" }];
    const passengerCount = passengers.length;

    if (flight.seats_available < passengerCount) {
      throw ApiError.conflict("Not enough seats available on this flight.");
    }

    const booking = await withTransaction(async (client) => {
      const reference = generateBookingReference();

      // 1. Insert booking
      const result = await client.query(
        `INSERT INTO bookings (booking_reference, user_id, flight_id, cabin_class, passenger_count, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING_PAYMENT')
         RETURNING *`,
        [reference, userId, input.flightId, input.cabinClass, passengerCount]
      );
      const created = result.rows[0];

      // 2. Insert passengers
   for (const p of passengers) {
  await client.query(
    `INSERT INTO booking_passengers
       (booking_id, flight_id, full_name, passport_number, date_of_birth, seat)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      created.id,
      input.flightId,          // ← new
      p.fullName,
      p.passportNumber || null,
      p.dateOfBirth || null,
      p.seat || null,
    ]
  );
}

      // 3. Race-safe seat decrement
      const upd = await client.query(
        `UPDATE flights
         SET seats_available = seats_available - $1
         WHERE id = $2 AND seats_available >= $1`,
        [passengerCount, input.flightId]
      );
      if (upd.rowCount === 0) {
        throw ApiError.conflict("Not enough seats available on this flight.");
      }

      return created;
    });

    // Hydrate passengers for consistent return shape
    const createdPassengers = await getPassengers(booking.id);

    // Audit (awaited)
    try {
      await auditService.log({
        actorType: "user",
        actorUserId: userId,
        action: "BOOKING_CREATED",
        entityType: "booking",
        entityId: booking.id,
        metadata: {
          bookingReference: booking.booking_reference,
          flightNumber: flight.flight_number,
          cabinClass: input.cabinClass,
          passengerCount,
          route: `${flight.origin_airport.iata_code} → ${flight.destination_airport.iata_code}`,
          status: "PENDING_PAYMENT",
        },
      });
    } catch (e) {
      console.error("[audit] BOOKING_CREATED failed", e);
    }

    // Notify (awaited, includes bookingId)
    try {
      await notificationsService.create(
        userId,
        "Complete your booking 💳",
        `Your booking for ${flight.flight_number} is reserved for ${passengerCount} passenger${
          passengerCount > 1 ? "s" : ""
        }. Complete payment to confirm. Ref: ${booking.booking_reference}`,
        "PAYMENT_PENDING",
        flight.id,
        booking.id
      );
    } catch (e) {
      console.error("[notify] PAYMENT_PENDING failed", e);
    }

    return { ...booking, flight, passengers: createdPassengers };
  },

  /* ---------------------------------------------------------------- */
  /* Confirm (payment webhook / admin action)                          */
  /* ---------------------------------------------------------------- */
  async confirm(bookingId: string, actorUserId?: string) {
    const booking = await this.getById(bookingId);

    if (booking.status === "CONFIRMED") {
      return booking; // idempotent
    }
    if (booking.status !== "PENDING_PAYMENT") {
      throw ApiError.badRequest(
        `Cannot confirm booking in status ${booking.status}.`
      );
    }

    await pool.query(
      `UPDATE bookings SET status = 'CONFIRMED', confirmed_at = now() WHERE id = $1`,
      [bookingId]
    );

    const updated = await this.getById(bookingId);

    try {
      await auditService.log({
        actorType: actorUserId ? "user" : "system",
        actorUserId: actorUserId || undefined,
        action: "BOOKING_CONFIRMED",
        entityType: "booking",
        entityId: bookingId,
        metadata: {
          bookingReference: updated.booking_reference,
          flightNumber: updated.flight.flight_number,
        },
      });
    } catch (e) {
      console.error("[audit] BOOKING_CONFIRMED failed", e);
    }

    try {
      await notificationsService.create(
        updated.user_id,
        "Booking confirmed ✅",
        `Your booking ${updated.booking_reference} for ${updated.flight.flight_number} is confirmed.`,
        "BOOKING_CONFIRMED",
        updated.flight.id,
        updated.id
      );
    } catch (e) {
      console.error("[notify] BOOKING_CONFIRMED failed", e);
    }

    return updated;
  },

  /* ---------------------------------------------------------------- */
  /* List for user                                                     */
  /* ---------------------------------------------------------------- */
  async listForUser(userId: string) {
    const result = await pool.query(
      `${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY f.departure_time DESC`,
      [userId]
    );
    const bookings = result.rows;
    if (!bookings.length) return bookings;

    const passengerMap = await getPassengersForBookings(
      bookings.map((b) => b.id)
    );
    for (const b of bookings) {
      b.passengers = passengerMap.get(b.id) || [];
    }
    return bookings;
  },

  /* ---------------------------------------------------------------- */
  /* Get by ID                                                         */
  /* ---------------------------------------------------------------- */
  async getById(id: string, userId?: string) {
    const conditions = userId
      ? "WHERE b.id = $1 AND b.user_id = $2"
      : "WHERE b.id = $1";
    const values = userId ? [id, userId] : [id];

    const result = await pool.query(`${BOOKING_SELECT} ${conditions}`, values);
    if (!result.rowCount) throw ApiError.notFound("Booking not found.");

    const booking = result.rows[0];
    booking.passengers = await getPassengers(booking.id);
    return booking;
  },

  /* ---------------------------------------------------------------- */
  /* Check-in                                                          */
  /* ---------------------------------------------------------------- */
  async checkIn(bookingId: string, userId: string, seats?: string[]) {
    const booking = await this.getById(bookingId, userId);
    if (booking.status !== "CONFIRMED") {
      throw ApiError.badRequest(
        "Only confirmed bookings can be checked in."
      );
    }

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE bookings SET status = 'CHECKED_IN', checked_in_at = now() WHERE id = $1`,
        [bookingId]
      );

      const passengers = await getPassengers(bookingId);

      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        const group = assignBoardingGroup(i);
        const seat =
          seats?.[i] || p.seat || (await assignSeat(client, booking.flight_id, i));

        // Update passenger with seat + group
        await client.query(
          `UPDATE booking_passengers
           SET boarding_group = $1, seat = $2, checked_in_at = now()
           WHERE id = $3`,
          [group, seat, p.id]
        );


        const usedSeats = new Set<string>();

for (let i = 0; i < passengers.length; i++) {
  const p = passengers[i];
  const group = assignBoardingGroup(i);

  let seat = seats?.[i] || p.seat;

  if (seat) {
    seat = seat.trim().toUpperCase();

    if (usedSeats.has(seat)) {
      throw ApiError.conflict(
        `Seat ${seat} is selected for multiple passengers.`
      );
    }

    const existingSeat = await client.query(
      `SELECT 1
       FROM booking_passengers
       WHERE flight_id = $1
         AND seat = $2
       LIMIT 1`,
      [booking.flight_id, seat]
    );

  if ((existingSeat.rowCount ?? 0) > 0) {
      throw ApiError.conflict(
        `Seat ${seat} is already occupied on this flight.`
      );
    }

    usedSeats.add(seat);
  } else {
    seat = await assignSeat(client, booking.flight_id, i);
    usedSeats.add(seat);
  }

  await client.query(
    `UPDATE booking_passengers
     SET boarding_group = $1,
         seat = $2,
         checked_in_at = now()
     WHERE id = $3`,
    [group, seat, p.id]
  );

  await client.query(
    `INSERT INTO baggage
       (booking_id, passenger_id, tag_reference, status)
     VALUES ($1, $2, $3, 'CHECKED_IN')`,
    [bookingId, p.id, generateBaggageTag()]
  );
}
        // One baggage tag per passenger, linked to passenger
        await client.query(
          `INSERT INTO baggage (booking_id, passenger_id, tag_reference, status)
           VALUES ($1, $2, $3, 'CHECKED_IN')`,
          [bookingId, p.id, generateBaggageTag()]
        );
      }
    });

    const updated = await this.getById(bookingId, userId);

    try {
      await auditService.log({
        actorType: "user",
        actorUserId: userId,
        action: "BOARDING_PASS_GENERATED",
        entityType: "booking",
        entityId: bookingId,
        metadata: {
          bookingReference: updated.booking_reference,
          flightNumber: updated.flight.flight_number,
          passengerCount: updated.passengers?.length,
        },
      });
    } catch (e) {
      console.error("[audit] BOARDING_PASS_GENERATED failed", e);
    }

    try {
      await notificationsService.create(
        userId,
        "Boarding pass ready 🎫",
        `You're checked in for ${updated.flight.flight_number}! ${
          updated.passengers?.length > 1
            ? `${updated.passengers.length} boarding passes ready.`
            : "Your boarding pass is ready."
        } Gate: ${updated.flight.gate?.code || "TBD"}`,
        "BOARDING_PASS",
        updated.flight.id,
        updated.id
      );
    } catch (e) {
      console.error("[notify] BOARDING_PASS failed", e);
    }

    try {
      await notificationsService.createAdminNotification(
        "Passenger checked in",
        `${updated.passengers?.length || 1} passenger(s) checked in for ${
          updated.flight.flight_number
        } — Ref: ${updated.booking_reference}`,
        "CHECK_IN",
        bookingId,
        "booking"
      );
    } catch (e) {
      console.error("[notify] admin CHECK_IN failed", e);
    }

    // Generate ONE email containing one PDF per passenger
    
void (async () => {
  try {
    const userRes = await pool.query(
      "SELECT full_name, email FROM users WHERE id = $1",
      [userId]
    );

    const user = userRes.rows[0];

    if (!user?.email) {
      console.error("[email] No email address found for user:", userId);
      return;
    }

    const f = updated.flight;
    const boardingPassPdfs: Buffer[] = [];

    // Generate ONE PDF for EACH passenger
    for (const p of updated.passengers || []) {
      const pdf = await generateTicketPdf({
        passengerName: p.full_name,
        bookingReference: updated.booking_reference,
        flightNumber: f.flight_number,
        originCode: f.origin_airport.iata_code,
        originCity: f.origin_airport.city,
        destinationCode: f.destination_airport.iata_code,
        destinationCity: f.destination_airport.city,
        departureTime: f.departure_time,
        gate: f.gate?.code,
        seat: p.seat,
        boardingGroup: p.boarding_group,
        cabinClass: updated.cabin_class,
      });

      boardingPassPdfs.push(pdf);
    }

    // ONE email containing ALL passenger PDFs
    await emailService.sendBoardingPass(
      user.email,
      {
        passengerName: user.full_name,
        flightNumber: f.flight_number,
        origin: f.origin_airport.iata_code,
        destination: f.destination_airport.iata_code,
        departureTime: new Date(f.departure_time).toUTCString(),
        bookingReference: updated.booking_reference,
      },
      boardingPassPdfs
    );

    console.log(
      `[email] Boarding pass email sent: ${boardingPassPdfs.length} PDF(s) attached`
    );
  } catch (e) {
    console.error("[email] boarding pass email failed", e);
  }
})();

    return updated;
  },

  /* ---------------------------------------------------------------- */
  /* Cancel                                                            */
  /* ---------------------------------------------------------------- */
  async cancel(bookingId: string, userId: string) {
    const booking = await this.getById(bookingId, userId);

    if (booking.status === "CANCELLED") {
      throw ApiError.badRequest("Booking already cancelled.");
    }
    if (booking.status === "CHECKED_IN") {
      throw ApiError.badRequest(
        "Checked-in bookings cannot be cancelled online. Please contact support."
      );
    }

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE bookings SET status = 'CANCELLED', cancelled_at = now() WHERE id = $1`,
        [bookingId]
      );
      await client.query(
        `UPDATE flights SET seats_available = seats_available + $1 WHERE id = $2`,
        [booking.passenger_count, booking.flight_id]
      );
    });

    try {
      await auditService.log({
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
    } catch (e) {
      console.error("[audit] BOOKING_CANCELLED failed", e);
    }

    try {
      await notificationsService.create(
        userId,
        "Booking cancelled",
        `Your booking ${booking.booking_reference} for ${booking.flight.flight_number} has been cancelled.`,
        "BOOKING_CANCELLED",
        booking.flight.id,
        booking.id
      );
    } catch (e) {
      console.error("[notify] BOOKING_CANCELLED failed", e);
    }

    // Fire-and-forget cancellation email
    const userRes = await pool.query(
      "SELECT full_name, email FROM users WHERE id = $1",
      [userId]
    );
    const user = userRes.rows[0];
    emailService
      .sendBookingCancellation(user.email, {
        passengerName: user.full_name,
        flightNumber: booking.flight.flight_number,
        origin: booking.flight.origin_airport.iata_code,
        destination: booking.flight.destination_airport.iata_code,
        departureTime: new Date(booking.flight.departure_time).toUTCString(),
        bookingReference: booking.booking_reference,
      })
      .catch((e) => console.error("[email] cancellation failed", e));

    return this.getById(bookingId, userId);
  },
};
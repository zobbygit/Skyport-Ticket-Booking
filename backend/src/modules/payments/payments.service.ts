import { pool, withTransaction } from "../../config/db";
import { ApiError } from "../../utils/apiError";
import { env } from "../../config/env";
import {
  createPaymentIntent,
  createRefund,
  retrievePaymentIntent,
} from "../../services/stripe/stripe.service";
import { emailService } from "../../services/email/email.service";
import { generateTicketPdf } from "../../services/pdf/ticket-pdf.service";
import { notificationsService } from "../notifications/notifications.service";
import { auditService } from "../../services/audit/audit.service";

const BOOKING_WITH_FLIGHT = `
  SELECT b.*,
    jsonb_build_object(
      'id', f.id,
      'flight_number', f.flight_number,
      'airline', f.airline,
      'departure_time', f.departure_time,
      'base_price', f.base_price,
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


async function getBookingPassengers(bookingId: string) {
  const res = await pool.query(
    `SELECT *
     FROM booking_passengers
     WHERE booking_id = $1
     ORDER BY created_at`,
    [bookingId]
  );

  return res.rows;
}

export const paymentsService = {
  /**
   * Creates a Stripe PaymentIntent for a PENDING_PAYMENT booking.
   * Returns the client_secret which the frontend passes to Stripe Elements.
   */
  async createPaymentIntent(bookingId: string, userId: string) {
    const res = await pool.query(`${BOOKING_WITH_FLIGHT} WHERE b.id = $1 AND b.user_id = $2`, [bookingId, userId]);
    if (!res.rowCount) throw ApiError.notFound("Booking not found.");

    const booking = res.rows[0];
    if (booking.status !== "PENDING_PAYMENT") {
      throw ApiError.badRequest("This booking has already been paid or is not awaiting payment.");
    }

    const amountCents = Math.round(Number(booking.flight.base_price) * booking.passenger_count * 100);
    const currency = env.stripe.currency;

    const intent = await createPaymentIntent(amountCents, currency, {
      bookingId: booking.id,
      bookingReference: booking.booking_reference,
      flightNumber: booking.flight.flight_number,
      userId,
    });

    // Store the intent so the webhook can look it up by stripe id
    await pool.query(
      `INSERT INTO payments (booking_id, stripe_payment_intent_id, amount, currency, stripe_client_secret)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (stripe_payment_intent_id) DO NOTHING`,
      [bookingId, intent.id, amountCents, currency, intent.client_secret]
    );

    return {
      clientSecret: intent.client_secret,
      amount: amountCents,
      currency,
      bookingReference: booking.booking_reference,
    };
  },

  /**
   * Called by the Stripe webhook when payment_intent.succeeded fires.
   * Confirms the booking, sends the confirmation email + PDF.
   */
  async confirmFromWebhook(paymentIntentId: string) {
    const paymentRes = await pool.query(
      "SELECT * FROM payments WHERE stripe_payment_intent_id = $1",
      [paymentIntentId]
    );
    if (!paymentRes.rowCount) return; // unknown intent — ignore

    const payment = paymentRes.rows[0];

    await withTransaction(async (client) => {
      await client.query(
        "UPDATE payments SET status = 'succeeded', updated_at = now() WHERE id = $1",
        [payment.id]
      );
      await client.query(
        "UPDATE bookings SET status = 'CONFIRMED', updated_at = now() WHERE id = $1 AND status = 'PENDING_PAYMENT'",
        [payment.booking_id]
      );
    });

    // Fetch full booking for email
    const bookingRes = await pool.query(
      `${BOOKING_WITH_FLIGHT} WHERE b.id = $1`,
      [payment.booking_id]
    );
    if (!bookingRes.rowCount) return;
   const booking = bookingRes.rows[0];

// Load ALL passengers for this booking
booking.passengers = await getBookingPassengers(booking.id);

const userRes = await pool.query(
  "SELECT full_name, email FROM users WHERE id = $1",
  [booking.user_id]
);
    const user = userRes.rows[0];
    if (!user) return;

    auditService.log({
      actorType: "system",
      action: "PAYMENT_SUCCEEDED",
      entityType: "payment",
      entityId: payment.id,
      metadata: { bookingId: payment.booking_id, paymentIntentId, amount: payment.amount },
    });

    notificationsService.create(
      booking.user_id,
      "Payment confirmed ✅",
      `Payment of $${(payment.amount / 100).toFixed(2)} received for ${booking.flight.flight_number}. Ref: ${booking.booking_reference}`,
      "PAYMENT",
      booking.flight.id
    );

    // Send confirmation email with PDF ticket
// Send ONE confirmation email containing ONE PDF per passenger
// (async () => {
//   try {
//     const passengers = booking.passengers || [];
//     const boardingPassPdfs: Buffer[] = [];

//     // Generate one PDF for EACH passenger
//     for (const passenger of passengers) {
//       const pdf = await generateTicketPdf({
//         passengerName: passenger.full_name,
//         bookingReference: booking.booking_reference,
//         flightNumber: booking.flight.flight_number,
//         originCode: booking.flight.origin_airport.iata_code,
//         originCity: booking.flight.origin_airport.city,
//         destinationCode: booking.flight.destination_airport.iata_code,
//         destinationCity: booking.flight.destination_airport.city,
//         departureTime: booking.flight.departure_time,
//         gate: booking.flight.gate?.code,
//         seat: passenger.seat,
//         boardingGroup: passenger.boarding_group,
//         cabinClass: booking.cabin_class,
//       });

//       boardingPassPdfs.push(pdf);
//     }

//     // ONE email containing ALL passenger PDFs
//     await emailService.sendBoardingPass(
//       user.email,
//       {
//         passengerName: user.full_name,
//         flightNumber: booking.flight.flight_number,
//         origin: booking.flight.origin_airport.iata_code,
//         destination: booking.flight.destination_airport.iata_code,
//         departureTime: new Date(
//           booking.flight.departure_time
//         ).toUTCString(),
//         bookingReference: booking.booking_reference,
//       },
//       boardingPassPdfs
//     );

//     console.log(
//       `[stripe-webhook] Boarding pass email sent with ${boardingPassPdfs.length} PDF(s)`
//     );
//   } catch (e) {
//     console.error("[stripe-webhook] email failed", e);
//   }
// })();

  },

  async failFromWebhook(paymentIntentId: string, reason?: string) {
    await pool.query(
      "UPDATE payments SET status = 'failed', failure_reason = $1, updated_at = now() WHERE stripe_payment_intent_id = $2",
      [reason || "Payment failed", paymentIntentId]
    );
    // Booking stays PENDING_PAYMENT — passenger can retry payment
  },

  async refund(bookingId: string, userId: string) {
    const paymentRes = await pool.query(
      "SELECT * FROM payments WHERE booking_id = $1 AND status = 'succeeded'",
      [bookingId]
    );
    if (!paymentRes.rowCount) throw ApiError.badRequest("No successful payment found for this booking.");

    const payment = paymentRes.rows[0];
    const refund = await createRefund(payment.stripe_payment_intent_id);

    await withTransaction(async (client) => {
      await client.query(
        "UPDATE payments SET status = 'refunded', refund_id = $1, updated_at = now() WHERE id = $2",
        [refund.id, payment.id]
      );
      await client.query(
        "UPDATE bookings SET status = 'CANCELLED', cancelled_at = now() WHERE id = $1",
        [bookingId]
      );
    });

    auditService.log({
      actorType: "user",
      actorUserId: userId,
      action: "BOOKING_REFUNDED",
      entityType: "payment",
      entityId: payment.id,
      metadata: { bookingId, refundId: refund.id, amount: payment.amount },
    });

    notificationsService.create(
      userId,
      "Refund processed 💳",
      `Your refund of $${(payment.amount / 100).toFixed(2)} has been initiated. It typically takes 5-10 business days.`,
      "REFUND"
    );

    return refund;
  },

  async getPaymentForBooking(bookingId: string) {
    const res = await pool.query(
      "SELECT id, amount, currency, status, created_at FROM payments WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1",
      [bookingId]
    );
    return res.rows[0] || null;
  },
};
export interface BookingEmailData {
  passengerName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  bookingReference: string;
}

export interface FlightStatusEmailData {
  passengerName: string;
  flightNumber: string;
  status: string;
  gate?: string | null;
}

const wrapper = (title: string, body: string) => `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h2 style="color:#0f172a;">${title}</h2>
    <div style="color:#334155; line-height:1.6;">${body}</div>
    <p style="margin-top:32px; color:#94a3b8; font-size:12px;">SkyPort Airport Services — this is an automated message.</p>
  </div>
`;

export const welcomeTemplate = (name: string) =>
  wrapper("Welcome aboard, " + name, `<p>Your SkyPort account is ready. Track flights, manage bookings, and get real-time gate updates all in one place.</p>`);

export const bookingConfirmationTemplate = (d: BookingEmailData) =>
  wrapper("Booking confirmed", `
    <p>Hi ${d.passengerName}, your booking is confirmed. Your e-ticket is attached to this email as a PDF.</p>
    <table style="width:100%; border-collapse:collapse; margin-top:12px;">
      <tr><td style="padding:6px 0; color:#64748b;">Flight</td><td style="text-align:right; font-weight:600;">${d.flightNumber}</td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Route</td><td style="text-align:right;">${d.origin} → ${d.destination}</td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Departure</td><td style="text-align:right;">${d.departureTime}</td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Reference</td><td style="text-align:right; font-weight:600;">${d.bookingReference}</td></tr>
    </table>
  `);

export const boardingPassEmailTemplate = (d: BookingEmailData) =>
  wrapper("You're checked in", `
    <p>Hi ${d.passengerName}, you're checked in for flight ${d.flightNumber}. Your boarding pass is attached to this email as a PDF — save it, screenshot it, or print it for the gate.</p>
    <table style="width:100%; border-collapse:collapse; margin-top:12px;">
      <tr><td style="padding:6px 0; color:#64748b;">Route</td><td style="text-align:right;">${d.origin} → ${d.destination}</td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Departure</td><td style="text-align:right;">${d.departureTime}</td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Reference</td><td style="text-align:right; font-weight:600;">${d.bookingReference}</td></tr>
    </table>
  `);

export const bookingCancellationTemplate = (d: BookingEmailData) =>
  wrapper("Booking cancelled", `<p>Hi ${d.passengerName}, your booking ${d.bookingReference} for flight ${d.flightNumber} has been cancelled.</p>`);

export const flightStatusTemplate = (d: FlightStatusEmailData) =>
  wrapper("Flight status update", `
    <p>Hi ${d.passengerName}, flight ${d.flightNumber} is now <strong>${d.status}</strong>${d.gate ? ` — Gate ${d.gate}` : ""}.</p>
  `);

export const passwordResetTemplate = (link: string) =>
  wrapper("Reset your password", `
    <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
    <p><a href="${link}" style="display:inline-block; margin-top:12px; padding:10px 20px; background:#2563eb; color:white; border-radius:8px; text-decoration:none;">Reset password</a></p>
  `);
import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../config/env";
import * as templates from "./email.templates";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.email.host || !env.email.user || !env.email.password) {
    console.warn("[email] Brevo SMTP not configured — emails will be logged instead of sent.");
    return null;
  }



  // if (!transporter) {
  //   transporter = nodemailer.createTransport({
  //     host: env.email.host,
  //     port: env.email.port,
  //     secure: env.email.port === 465,
  //     auth: { user: env.email.user, pass: env.email.password },
  //   });
  // }

  if (!transporter) {
  console.log("[email] SMTP config:", {
    host: env.email.host,
    port: env.email.port,
    user: env.email.user,
    fromEmail: env.email.fromEmail,
    passwordLoaded: Boolean(env.email.password),
  });

  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: { user: env.email.user, pass: env.email.password },
  });
}




  return transporter;
}

interface Attachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

async function send(to: string, subject: string, html: string, attachments?: Attachment[]) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:dev-mode] To: ${to} | Subject: ${subject}${attachments?.length ? ` | Attachments: ${attachments.map((a) => a.filename).join(", ")}` : ""}`);
    return;
  }
  await t.sendMail({
    from: `"${env.email.fromName}" <${env.email.fromEmail}>`,
    to,
    subject,
    html,
    attachments,
  });
}

export const emailService = {
  sendWelcome: (to: string, name: string) =>
    send(to, "Welcome to SkyPort", templates.welcomeTemplate(name)),

  sendBookingConfirmation: (to: string, data: templates.BookingEmailData, ticketPdf?: Buffer) =>
    send(
      to,
      `Booking confirmed — ${data.flightNumber}`,
      templates.bookingConfirmationTemplate(data),
      ticketPdf ? [{ filename: `SkyPort-eTicket-${data.bookingReference}.pdf`, content: ticketPdf, contentType: "application/pdf" }] : undefined
    ),

  sendBookingCancellation: (to: string, data: templates.BookingEmailData) =>
    send(to, `Booking cancelled — ${data.flightNumber}`, templates.bookingCancellationTemplate(data)),

  sendBoardingPass: (to: string, data: templates.BookingEmailData, boardingPassPdf: Buffer) =>
    send(
      to,
      `Boarding pass — ${data.flightNumber}`,
      templates.boardingPassEmailTemplate(data),
      [{ filename: `SkyPort-BoardingPass-${data.bookingReference}.pdf`, content: boardingPassPdf, contentType: "application/pdf" }]
    ),

  sendFlightStatusUpdate: (to: string, data: templates.FlightStatusEmailData) =>
    send(to, `Flight update — ${data.flightNumber} is now ${data.status}`, templates.flightStatusTemplate(data)),

  sendPasswordReset: (to: string, resetLink: string) =>
    send(to, "Reset your SkyPort password", templates.passwordResetTemplate(resetLink)),
};
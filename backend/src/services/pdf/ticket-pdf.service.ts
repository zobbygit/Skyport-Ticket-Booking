import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export interface TicketPdfData {
  passengerName: string;
  bookingReference: string;
  flightNumber: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  departureTime: string; // ISO
  gate?: string | null;
  seat?: string | null;
  boardingGroup?: string | null;
  cabinClass: string;
}

/**
 * Renders a compact boarding-pass-style PDF (roughly credit-card-strip
 * shaped) with a real scannable QR code. Used both for the initial booking
 * confirmation e-ticket and the post-check-in boarding pass — same layout,
 * different copy in the surrounding email.
 */
export async function generateTicketPdf(data: TicketPdfData): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(
    JSON.stringify({ ref: data.bookingReference, flight: data.flightNumber, seat: data.seat || "TBD" }),
    { margin: 0 }
  );
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [420, 220], margin: 0 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Background + header band
    doc.rect(0, 0, 420, 220).fill("#ffffff");
    doc.rect(0, 0, 420, 56).fill("#2563eb");
    doc.fillColor("#ffffff").fontSize(16).font("Helvetica-Bold").text("SkyPort", 20, 18);
    doc.fontSize(9).font("Helvetica").text(data.cabinClass.replace(/_/g, " "), 300, 22, { width: 100, align: "right" });

    // Route
    doc.fillColor("#0f172a").fontSize(22).font("Helvetica-Bold").text(data.originCode, 20, 74);
    doc.fontSize(9).font("Helvetica").fillColor("#64748b").text(data.originCity, 20, 100);

    doc.fillColor("#0f172a").fontSize(22).font("Helvetica-Bold").text(data.destinationCode, 300, 74, { width: 100, align: "right" });
    doc.fontSize(9).font("Helvetica").fillColor("#64748b").text(data.destinationCity, 300, 100, { width: 100, align: "right" });

    // Field grid
    const fields: [string, string][] = [
      ["PASSENGER", data.passengerName],
      ["FLIGHT", data.flightNumber],
      ["DATE", new Date(data.departureTime).toDateString()],
      ["GATE", data.gate || "TBD"],
      ["SEAT", data.seat || "TBD"],
      ["GROUP", data.boardingGroup || "-"],
    ];
    fields.forEach(([label, value], i) => {
      const x = 20 + (i % 3) * 100;
      const y = 136 + Math.floor(i / 3) * 34;
      doc.fontSize(7).fillColor("#94a3b8").font("Helvetica").text(label, x, y);
      doc.fontSize(11).fillColor("#0f172a").font("Helvetica-Bold").text(value, x, y + 10, { width: 90 });
    });

    // QR + reference
    doc.image(qrBuffer, 335, 128, { width: 60, height: 60 });
    doc.fontSize(7).fillColor("#94a3b8").font("Helvetica").text(data.bookingReference, 325, 192, { width: 80, align: "center" });

    doc.end();
  });
}
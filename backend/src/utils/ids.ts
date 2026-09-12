/** Human-friendly reference codes (booking refs, baggage tags) — not DB primary keys. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

function randomCode(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function generateBookingReference(): string {
  return randomCode(6);
}

export function generateBaggageTag(): string {
  return `SK${randomCode(4)}${Math.floor(Math.random() * 90 + 10)}`;
}

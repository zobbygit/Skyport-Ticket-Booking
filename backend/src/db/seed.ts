import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { env } from "../config/env";

/**
 * Seeds:
 *  - the SUPER_ADMIN account from env vars (never hardcoded)
 *  - two demo airports, terminals, gates, a handful of flights
 * Safe to re-run (idempotent upserts).
 */
async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- Super admin ---
    if (env.superAdmin.email && env.superAdmin.password) {
      const hash = await bcrypt.hash(env.superAdmin.password, 12);
      await client.query(
        `INSERT INTO admins (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, 'SUPER_ADMIN')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [env.superAdmin.name, env.superAdmin.email, hash]
      );
      console.log(`[seed] Super admin ready: ${env.superAdmin.email}`);
    } else {
      console.warn("[seed] SUPER_ADMIN_EMAIL/PASSWORD not set — skipping admin seed.");
    }

    // --- Airports ---
    const airports = [
      { iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", tz: "America/New_York", lat: 40.6413, lon: -73.7781 },
      { iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", tz: "America/Los_Angeles", lat: 33.9416, lon: -118.4085 },
      { iata: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", tz: "Europe/London", lat: 51.4700, lon: -0.4543 },
    ];

    const airportIds: Record<string, string> = {};
    for (const a of airports) {
      const res = await client.query(
        `INSERT INTO airports (iata_code, name, city, country, timezone, latitude, longitude, facilities, transportation, security_info)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (iata_code) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [
          a.iata, a.name, a.city, a.country, a.tz, a.lat, a.lon,
          JSON.stringify(["Free WiFi", "Lounges", "Duty Free", "Restaurants", "Baby Care Rooms"]),
          JSON.stringify(["Metro", "Taxi", "Airport Shuttle", "Rental Cars"]),
          JSON.stringify({ standardWaitMinutes: 15, recommendedArrivalHours: 2.5 }),
        ]
      );
      airportIds[a.iata] = res.rows[0].id;
    }

    // --- Terminals + gates for JFK ---
    const termRes = await client.query(
      `INSERT INTO terminals (airport_id, code, name, congestion_level)
       VALUES ($1, 'T4', 'Terminal 4', 'MODERATE')
       ON CONFLICT (airport_id, code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [airportIds["JFK"]]
    );
    const terminalId = termRes.rows[0].id;

    const gateRes = await client.query(
      `INSERT INTO gates (terminal_id, code, status)
       VALUES ($1, 'A12', 'AVAILABLE')
       ON CONFLICT (terminal_id, code) DO UPDATE SET status = EXCLUDED.status
       RETURNING id`,
      [terminalId]
    );
    const gateId = gateRes.rows[0].id;

    // Map points for JFK T4
    const mapPoints: [string, string, number, number][] = [
      ["GATE", "Gate A12", 20, 30],
      ["CHECKIN", "Check-in Row A", 5, 10],
      ["SECURITY", "Security Checkpoint 2", 12, 15],
      ["BAGGAGE_BELT", "Baggage Belt 4", 8, 40],
      ["LOUNGE", "SkyPort Lounge", 25, 8],
      ["RESTAURANT", "Terminal Grill", 18, 20],
      ["SHOP", "Duty Free", 15, 22],
      ["RESTROOM", "Restroom C", 22, 18],
      ["PARKING", "Parking Garage 4", 2, 2],
      ["INFO_DESK", "Information Desk", 10, 5],
      ["TRANSPORT", "AirTrain Station", 1, 45],
    ];
    for (const [type, label, x, y] of mapPoints) {
      await client.query(
        `INSERT INTO map_points (airport_id, terminal_id, type, label, x, y)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [airportIds["JFK"], terminalId, type, label, x, y]
      );
    }

    // --- A few flights ---
    const now = new Date();
    const inHours = (h: number) => new Date(now.getTime() + h * 3600 * 1000);

    const flights = [
      {
        num: "SK101", airline: "SkyPort Air", aircraft: "Boeing 787-9",
        origin: airportIds["JFK"], dest: airportIds["LHR"],
        dep: inHours(4), arr: inHours(11), boarding: inHours(3.4),
        terminal: terminalId, gate: gateId, status: "CHECK_IN_OPEN", price: 620,
      },
      {
        num: "SK202", airline: "SkyPort Air", aircraft: "Airbus A321neo",
        origin: airportIds["JFK"], dest: airportIds["LAX"],
        dep: inHours(1.5), arr: inHours(4.7), boarding: inHours(1),
        terminal: terminalId, gate: gateId, status: "BOARDING", price: 210,
      },
      {
        num: "SK330", airline: "SkyPort Air", aircraft: "Boeing 737 MAX 8",
        origin: airportIds["LAX"], dest: airportIds["JFK"],
        dep: inHours(30), arr: inHours(36), boarding: inHours(29.4),
        terminal: null, gate: null, status: "SCHEDULED", price: 245,
      },
    ];

    for (const f of flights) {
      await client.query(
        `INSERT INTO flights
          (flight_number, airline, aircraft, origin_airport_id, destination_airport_id,
           departure_time, arrival_time, terminal_id, gate_id, boarding_time, status, base_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT DO NOTHING`,
        [f.num, f.airline, f.aircraft, f.origin, f.dest, f.dep, f.arr, f.terminal, f.gate, f.boarding, f.status, f.price]
      );
    }

    await client.query("COMMIT");
    console.log("[seed] Demo airports/terminals/gates/flights ready.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});

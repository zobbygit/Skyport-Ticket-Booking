import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyAccessToken } from "../../utils/jwt";
import { env } from "../../config/env";

let io: SocketIOServer | null = null;

/**
 * Rooms:
 *  - `user:<userId>`   → personal notifications, "your flight" updates
 *  - `flight:<flightId>` → anyone viewing that flight's details/tracking page
 *  - `admin:ops`       → all connected admins, for operational broadcasts
 */
export function initSocket(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket: Socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || "");
      const passengerToken = cookies["skyport_at"];
      const adminToken = cookies["skyport_admin_at"];

 if (adminToken) {
  const payload = verifyAccessToken(adminToken);
  socket.data.auth = { id: payload.sub, role: payload.role, aud: "admin" };
} else if (passengerToken) {
  const payload = verifyAccessToken(passengerToken);
  socket.data.auth = { id: payload.sub, role: payload.role, aud: "passenger" };
}
      next();
    } catch {
      next(); // allow anonymous connections (public flight-status viewers)
    }
  });

  io.on("connection", (socket) => {
    const auth = socket.data.auth;
    if (auth?.aud === "passenger") socket.join(`user:${auth.id}`);
    if (auth?.aud === "admin") socket.join("admin:ops");

    socket.on("flight:subscribe", (flightId: string) => {
      if (typeof flightId === "string") socket.join(`flight:${flightId}`);
    });
    socket.on("flight:unsubscribe", (flightId: string) => {
      if (typeof flightId === "string") socket.leave(`flight:${flightId}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.IO not initialized — call initSocket(server) first");
  return io;
}

function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = decodeURIComponent(pair.slice(idx + 1).trim());
    out[key] = val;
  });
  return out;
}

// ---- Typed emit helpers used by services elsewhere in the app ----

export function emitFlightUpdate(flightId: string, payload: unknown) {
  getIO().to(`flight:${flightId}`).emit("flight:update", payload);
}

export function emitUserNotification(userId: string, payload: unknown) {
  getIO().to(`user:${userId}`).emit("notification:new", payload);
}

export function emitAdminOpsEvent(payload: unknown) {
  getIO().to("admin:ops").emit("ops:event", payload);
}

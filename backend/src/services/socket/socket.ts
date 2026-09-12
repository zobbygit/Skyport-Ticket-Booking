import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../../config/env";
import { verifyAccessToken } from "../../utils/jwt";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  const allowedOrigins = [
    env.clientUrl,
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    // Optional auth: attaches user/admin identity to the socket if a valid
    // token is provided, but connection still succeeds without one (public
    // flight-status rooms don't require login).
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        socket.data.auth = payload;
        socket.join(`${payload.audience}:${payload.sub}`);
        if (payload.audience === "admin") socket.join("admins");
      } catch {
        // ignore invalid token
      }
    }

    socket.on("subscribe:flight", (flightId: string) => {
      if (typeof flightId === "string") socket.join(`flight:${flightId}`);
    });

    socket.on("unsubscribe:flight", (flightId: string) => {
      if (typeof flightId === "string") socket.leave(`flight:${flightId}`);
    });

    socket.on("subscribe:airport", (airportId: string) => {
      if (typeof airportId === "string") socket.join(`airport:${airportId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized. Call initSocket() first.");
  return io;
}

/** Emit helpers used by controllers/services so call sites stay declarative. */
export const realtime = {
  flightUpdated: (flightId: string, payload: unknown) => {
    getIO().to(`flight:${flightId}`).emit("flight:updated", payload);
  },
  baggageUpdated: (userId: string, payload: unknown) => {
    getIO().to(`passenger:${userId}`).emit("baggage:updated", payload);
  },
  notificationCreated: (userId: string, payload: unknown) => {
    getIO().to(`passenger:${userId}`).emit("notification:new", payload);
  },
  adminNotificationCreated: (payload: unknown) => {
    getIO().to("admins").emit("admin:notification:new", payload);
  },
  announcementCreated: (airportId: string | null, payload: unknown) => {
    if (airportId) getIO().to(`airport:${airportId}`).emit("announcement:new", payload);
    else getIO().emit("announcement:new", payload);
  },
};
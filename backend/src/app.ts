import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { globalRateLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import flightRoutes from "./modules/flights/flights.routes";
import bookingRoutes from "./modules/bookings/bookings.routes";
import baggageRoutes from "./modules/baggage/baggage.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import airportRoutes from "./modules/airports/airports.routes";
import gateRoutes from "./modules/gates/gates.routes";
import announcementRoutes from "./modules/announcements/announcements.routes";
import adminRoutes from "./modules/admin/admin.routes";
import paymentsRoutes from "./modules/payments/payments.routes";

const app = express();

const allowedOrigins = [
  env.clientUrl,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Stripe webhooks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));

// Stripe webhook needs raw body — mount BEFORE express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(globalRateLimiter);

app.get("/health", (_req, res) => res.json({ success: true, status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/baggage", baggageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/gates", gateRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
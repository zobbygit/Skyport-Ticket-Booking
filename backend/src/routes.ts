import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import flightsRoutes from "./modules/flights/flights.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";
import baggageRoutes from "./modules/baggage/baggage.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import airportsRoutes from "./modules/airports/airports.routes";
import gatesRoutes from "./modules/gates/gates.routes";
import announcementsRoutes from "./modules/announcements/announcements.routes";
import adminRoutes from "./modules/admin/admin.routes";
import usersRoutes from "./modules/users/users.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/flights", flightsRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/baggage", baggageRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/airports", airportsRoutes);
router.use("/gates", gatesRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/admin", adminRoutes);
router.use("/users", usersRoutes);

router.get("/health", (_req, res) => res.json({ success: true, message: "SkyPort API is running" }));

export default router;

import { Router } from "express";
import { notificationsController } from "./notifications.controller";
import { requireAdminAuth, requirePassengerAuth } from "../../middleware/auth";

const router = Router();

// Passenger
router.get("/", requirePassengerAuth, notificationsController.listMine);
router.get("/unread-count", requirePassengerAuth, notificationsController.unreadCount);
router.patch("/read-all", requirePassengerAuth, notificationsController.markAllRead);
router.patch("/:id/read", requirePassengerAuth, notificationsController.markRead);

// Admin
router.get("/admin", requireAdminAuth, notificationsController.listAdmin);
router.get("/admin/unread-count", requireAdminAuth, notificationsController.adminUnreadCount);
router.patch("/admin/read-all", requireAdminAuth, notificationsController.markAllAdminRead);
router.patch("/admin/:id/read", requireAdminAuth, notificationsController.markAdminRead);

export default router;
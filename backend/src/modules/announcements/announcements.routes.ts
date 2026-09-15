import { Router } from "express";
import { announcementsController } from "./announcements.controller";
import { requireAdminAuth } from "../../middleware/auth";
import { requireAdminRole } from "../../middleware/rbac";

const router = Router();
router.get("/", announcementsController.list);
router.post("/", requireAdminAuth, requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN"), announcementsController.create);
router.delete(
  "/:id",
  requireAdminAuth,
  requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN"),
  announcementsController.remove
);

export default router;

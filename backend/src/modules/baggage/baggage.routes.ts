import { Router } from "express";
import { baggageController } from "./baggage.controller";
import { requireAdminAuth, requirePassengerAuth } from "../../middleware/auth";
import { requireAdminRole } from "../../middleware/rbac";

const router = Router();

router.get("/mine", requirePassengerAuth, baggageController.listMine);
router.get("/track/:tag", baggageController.getByTag);
router.post("/:id/report", requirePassengerAuth, baggageController.report);
router.patch("/:id/status", requireAdminAuth, requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN"), baggageController.updateStatus);

export default router;

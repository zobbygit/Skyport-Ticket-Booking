import { Router } from "express";
import { flightsController } from "./flights.controller";
import { requireAdminAuth } from "../../middleware/auth";
import { requireAdminRole } from "../../middleware/rbac";

const router = Router();

// Public / passenger-facing
router.get("/", flightsController.search);
router.get("/number/:flightNumber", flightsController.getByNumber);
router.get("/:id", flightsController.getById);
router.get("/:id/events", flightsController.events);

// Admin-only
router.post("/", requireAdminAuth, requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN", "FLIGHT_MANAGER"), flightsController.create);
router.patch("/:id/status", requireAdminAuth, requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN", "FLIGHT_MANAGER"), flightsController.updateStatus);
router.patch("/:id/gate", requireAdminAuth, requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN", "FLIGHT_MANAGER"), flightsController.updateGate);

export default router;

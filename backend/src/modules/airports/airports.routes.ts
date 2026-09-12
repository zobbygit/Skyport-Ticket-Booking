import { Router } from "express";
import { airportsController } from "./airports.controller";
import { requireAdminAuth } from "../../middleware/auth";
import { requireAdminRole } from "../../middleware/rbac";

const router = Router();

router.get("/", airportsController.list);
router.get("/:iata", airportsController.getByIata);
router.get("/:id/terminals", airportsController.terminals);
router.get("/:id/map-points", airportsController.mapPoints);

const adminOnly = [requireAdminAuth, requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN")];
router.post("/", ...adminOnly, airportsController.create);
router.post("/:id/terminals", ...adminOnly, airportsController.createTerminal);
router.post("/:id/map-points", ...adminOnly, airportsController.createMapPoint);
router.delete("/:id/map-points/:pointId", ...adminOnly, airportsController.deleteMapPoint);

export default router;
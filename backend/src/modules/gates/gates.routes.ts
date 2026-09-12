import { Router } from "express";
import { gatesController } from "./gates.controller";
import { requireAdminAuth } from "../../middleware/auth";
import { requireAdminRole } from "../../middleware/rbac";

const router = Router();
router.get("/terminal/:terminalId", gatesController.listByTerminal);
router.post("/terminal/:terminalId", requireAdminAuth, requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN"), gatesController.create);
router.patch("/:id/status", requireAdminAuth, requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN"), gatesController.updateStatus);

export default router;
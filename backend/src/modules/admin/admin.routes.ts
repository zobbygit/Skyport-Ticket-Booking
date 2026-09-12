import { Router } from "express";
import { adminController } from "./admin.controller";
import { requireAdminAuth } from "../../middleware/auth";
import { requireAdminRole } from "../../middleware/rbac";

const router = Router();
router.use(requireAdminAuth);

router.get("/stats", adminController.stats);
router.get("/analytics", requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN"), adminController.analytics);

router.get("/admins", requireAdminRole("SUPER_ADMIN"), adminController.listAdmins);
router.post("/admins", requireAdminRole("SUPER_ADMIN"), adminController.createAdmin);
router.patch("/admins/:id/active", requireAdminRole("SUPER_ADMIN"), adminController.setAdminActive);

router.get("/passengers", requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN"), adminController.listPassengers);
router.patch("/passengers/:id/active", requireAdminRole("SUPER_ADMIN", "OPERATIONS_ADMIN"), adminController.setPassengerActive);

router.get("/audit-logs", requireAdminRole("SUPER_ADMIN"), adminController.auditLogs);
router.get("/audit-logs/export/json", requireAdminRole("SUPER_ADMIN"), adminController.exportAuditJson);
router.get("/audit-logs/export/pdf", requireAdminRole("SUPER_ADMIN"), adminController.exportAuditPdf);

export default router;
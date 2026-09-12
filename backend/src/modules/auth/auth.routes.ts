import { Router } from "express";
import { authController } from "./auth.controller";
import { requireAdminAuth, requirePassengerAuth } from "../../middleware/auth";
import { strictRateLimiter } from "../../middleware/rateLimiter";

const router = Router();

router.post("/register", strictRateLimiter, authController.register);
router.post("/login", strictRateLimiter, authController.loginPassenger);
router.post("/admin/login", strictRateLimiter, authController.loginAdmin);
router.post("/refresh", authController.refreshPassenger);
router.post("/admin/refresh", authController.refreshAdmin);
router.post("/logout", authController.logout);
router.get("/me", requirePassengerAuth, authController.me);
router.get("/admin/me", requireAdminAuth, authController.me);

export default router;

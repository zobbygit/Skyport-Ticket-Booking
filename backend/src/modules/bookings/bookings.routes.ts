import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { requirePassengerAuth } from "../../middleware/auth";

const router = Router();
router.use(requirePassengerAuth);

router.post("/", bookingsController.create);
router.get("/", bookingsController.listMine);
router.get("/:id", bookingsController.getById);
router.post("/:id/check-in", bookingsController.checkIn);
router.post("/:id/cancel", bookingsController.cancel);

export default router;

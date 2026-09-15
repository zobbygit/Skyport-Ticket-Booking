import { Router } from "express";
import { addonsController } from "./addons.controller";
import { requirePassengerAuth } from "../../middleware/auth";

const router = Router();
router.get("/catalog", addonsController.catalog);
router.get("/booking/:bookingId", requirePassengerAuth, addonsController.list);
router.post("/booking/:bookingId", requirePassengerAuth, addonsController.add);
router.delete("/:addonId", requirePassengerAuth, addonsController.remove);
export default router;
import { Router } from "express";
import express from "express";
import { paymentsController } from "./payments.controller";
import { requirePassengerAuth } from "../../middleware/auth";

const router = Router();

// Webhook must use raw body — mounted before json() globally via app.ts
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentsController.webhook
);

// Passenger routes
router.post("/booking/:bookingId/intent", requirePassengerAuth, paymentsController.createIntent);
router.get("/booking/:bookingId", requirePassengerAuth, paymentsController.getPayment);
router.post("/booking/:bookingId/refund", requirePassengerAuth, paymentsController.refund);

export default router;
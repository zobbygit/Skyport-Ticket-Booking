import { Router } from "express";
import { pricingController } from "./pricing.controller";

const router = Router();
router.get("/currencies", pricingController.currencies);
router.get("/convert", pricingController.convert);
export default router;
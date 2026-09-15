import { Router } from "express";

import { weatherController } from "./weather.controller";

const router = Router();

router.get("/", weatherController.getCurrentWeather);

export default router;
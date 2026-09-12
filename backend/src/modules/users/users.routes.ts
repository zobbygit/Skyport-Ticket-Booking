import { Router } from "express";
import multer from "multer";
import { usersController } from "./users.controller";
import { requirePassengerAuth } from "../../middleware/auth";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();
router.use(requirePassengerAuth);

router.get("/me", usersController.me);
router.patch("/me", usersController.updateProfile);
router.post("/me/avatar", upload.single("avatar"), usersController.uploadAvatar);
router.get("/me/saved", usersController.listSaved);
router.post("/me/saved", usersController.saveItem);
router.delete("/me/saved/:id", usersController.unsaveItem);

export default router;

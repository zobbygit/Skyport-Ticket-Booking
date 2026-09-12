import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { usersService } from "./users.service";
import { uploadAvatar } from "../../services/cloudinary/cloudinary.service";
import { ApiError } from "../../utils/apiError";

export const usersController = {
  me: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await usersService.getProfile(req.auth!.sub) });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await usersService.updateProfile(req.auth!.sub, req.body) });
  }),

  uploadAvatar: asyncHandler(async (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) throw ApiError.badRequest("No file uploaded.");
    const url = await uploadAvatar(file.buffer, req.auth!.sub);
    res.json({ success: true, data: await usersService.updateAvatar(req.auth!.sub, url) });
  }),

  listSaved: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await usersService.listSaved(req.auth!.sub) });
  }),

  saveItem: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await usersService.saveItem(req.auth!.sub, req.body) });
  }),

  unsaveItem: asyncHandler(async (req: Request, res: Response) => {
    await usersService.unsaveItem(req.auth!.sub, req.params.id);
    res.json({ success: true });
  }),
};

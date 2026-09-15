import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { addonsService } from "./addons.service";
import { ApiError } from "../../utils/apiError";

export const addonsController = {
  catalog: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: addonsService.catalog() });
  }),
  list: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await addonsService.listForBooking(req.params.bookingId) });
  }),
  add: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.type) throw ApiError.badRequest("type is required.");
    const addon = await addonsService.add(req.params.bookingId, req.auth!.sub, req.body.type);
    res.status(201).json({ success: true, data: addon });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await addonsService.remove(req.params.addonId, req.auth!.sub);
    res.json({ success: true });
  }),
};
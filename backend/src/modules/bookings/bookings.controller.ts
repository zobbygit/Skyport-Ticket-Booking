import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { bookingsService } from "./bookings.service";
import { ApiError } from "../../utils/apiError";

export const bookingsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.flightId || !req.body.cabinClass) throw ApiError.badRequest("flightId and cabinClass are required.");
    const booking = await bookingsService.create(req.auth!.sub, req.body);
    res.status(201).json({ success: true, data: booking });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const bookings = await bookingsService.listForUser(req.auth!.sub);
    res.json({ success: true, data: bookings });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingsService.getById(req.params.id, req.auth!.sub);
    res.json({ success: true, data: booking });
  }),

  checkIn: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingsService.checkIn(req.params.id, req.auth!.sub, req.body?.seat);
    res.json({ success: true, data: booking });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingsService.cancel(req.params.id, req.auth!.sub);
    res.json({ success: true, data: booking });
  }),
};

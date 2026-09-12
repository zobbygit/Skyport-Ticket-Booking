import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { baggageService } from "./baggage.service";
import { ApiError } from "../../utils/apiError";

export const baggageController = {
  getByTag: asyncHandler(async (req: Request, res: Response) => {
    const bag = await baggageService.getByTag(req.params.tag);
    res.json({ success: true, data: bag });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const bags = await baggageService.listForUser(req.auth!.sub);
    res.json({ success: true, data: bags });
  }),

  report: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.description) throw ApiError.badRequest("description is required.");
    const report = await baggageService.fileReport(req.params.id, req.auth!.sub, req.body.description);
    res.status(201).json({ success: true, data: report });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.status) throw ApiError.badRequest("status is required.");
    const bag = await baggageService.updateStatus(req.params.id, req.body.status, req.body.belt, req.body.location);
    res.json({ success: true, data: bag });
  }),
};

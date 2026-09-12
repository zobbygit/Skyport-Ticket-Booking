import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { gatesService } from "./gates.service";
import { ApiError } from "../../utils/apiError";

export const gatesController = {
  listByTerminal: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await gatesService.listByTerminal(req.params.terminalId) });
  }),
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.status) throw ApiError.badRequest("status is required.");
    res.json({ success: true, data: await gatesService.updateStatus(req.params.id, req.body.status) });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.code) throw ApiError.badRequest("code is required.");
    res.status(201).json({ success: true, data: await gatesService.create(req.params.terminalId, req.body.code) });
  }),
};
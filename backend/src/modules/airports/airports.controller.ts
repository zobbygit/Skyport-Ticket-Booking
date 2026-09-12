import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { airportsService } from "./airports.service";
import { ApiError } from "../../utils/apiError";

export const airportsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await airportsService.list() });
  }),
  getByIata: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await airportsService.getByIata(req.params.iata) });
  }),
  terminals: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await airportsService.getTerminals(req.params.id) });
  }),
  mapPoints: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: await airportsService.getMapPoints(req.params.id, req.query.terminalId as string) });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { iataCode, name, city, country } = req.body;
    if (!iataCode || !name || !city || !country) throw ApiError.badRequest("iataCode, name, city, country are required.");
    const airport = await airportsService.create({ ...req.body, adminId: req.auth?.sub });
    res.status(201).json({ success: true, data: airport });
  }),

  createTerminal: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.code || !req.body.name) throw ApiError.badRequest("code and name are required.");
    const terminal = await airportsService.createTerminal(req.params.id, { ...req.body, adminId: req.auth?.sub });
    res.status(201).json({ success: true, data: terminal });
  }),

  createMapPoint: asyncHandler(async (req: Request, res: Response) => {
    const { type, label, x, y } = req.body;
    if (!type || !label || x === undefined || y === undefined) throw ApiError.badRequest("type, label, x, y are required.");
    const point = await airportsService.createMapPoint(req.params.id, req.body);
    res.status(201).json({ success: true, data: point });
  }),

  deleteMapPoint: asyncHandler(async (req: Request, res: Response) => {
    await airportsService.deleteMapPoint(req.params.pointId);
    res.json({ success: true });
  }),
};
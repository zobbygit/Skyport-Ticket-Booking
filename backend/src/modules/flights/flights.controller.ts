import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { flightsService } from "./flights.service";
import { ApiError } from "../../utils/apiError";

export const flightsController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const { origin, destination, date, airline, page, pageSize } = req.query;
    const flights = await flightsService.search({
      origin: origin as string,
      destination: destination as string,
      date: date as string,
      airline: airline as string,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    res.json({ success: true, data: flights });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const flight = await flightsService.getById(req.params.id);
    res.json({ success: true, data: flight });
  }),

  getByNumber: asyncHandler(async (req: Request, res: Response) => {
    const flight = await flightsService.getByNumber(req.params.flightNumber);
    res.json({ success: true, data: flight });
  }),

  events: asyncHandler(async (req: Request, res: Response) => {
    const events = await flightsService.listEvents(req.params.id);
    res.json({ success: true, data: events });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const flight = await flightsService.create(req.body, req.auth?.sub);
    res.status(201).json({ success: true, data: flight });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.status) throw ApiError.badRequest("status is required.");
    const flight = await flightsService.updateStatus(req.params.id, req.body.status, req.auth!.sub);
    res.json({ success: true, data: flight });
  }),

  updateGate: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.gateId) throw ApiError.badRequest("gateId is required.");
    const flight = await flightsService.updateGate(req.params.id, req.body.gateId, req.auth!.sub);
    res.json({ success: true, data: flight });
  }),
};
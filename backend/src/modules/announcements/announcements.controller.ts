import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { announcementsService } from "./announcements.service";
import { ApiError } from "../../utils/apiError";

export const announcementsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: await announcementsService.list(
        req.query.airportId as string
      ),
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.title || !req.body.message) {
      throw ApiError.badRequest(
        "title and message are required."
      );
    }

    const announcement = await announcementsService.create(
      req.auth!.sub,
      req.body
    );

    res.status(201).json({
      success: true,
      data: announcement,
    });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const announcement = await announcementsService.remove(
      req.params.id
    );

    if (!announcement) {
      throw ApiError.notFound("Announcement not found.");
    }

    res.json({
      success: true,
      data: announcement,
    });
  }),
};
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { notificationsService } from "./notifications.service";

export const notificationsController = {
  // ─── Passenger ─────────────────────────────────────────────────────────────
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const items = await notificationsService.listForUser(req.auth!.sub);
    res.json({ success: true, data: items });
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationsService.unreadCount(req.auth!.sub);
    res.json({ success: true, data: { count } });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markRead(req.params.id, req.auth!.sub);
    res.json({ success: true });
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markAllRead(req.auth!.sub);
    res.json({ success: true });
  }),

  // ─── Admin ──────────────────────────────────────────────────────────────────
  listAdmin: asyncHandler(async (_req: Request, res: Response) => {
    const items = await notificationsService.listAdminNotifications();
    res.json({ success: true, data: items });
  }),

  adminUnreadCount: asyncHandler(async (_req: Request, res: Response) => {
    const count = await notificationsService.unreadAdminCount();
    res.json({ success: true, data: { count } });
  }),

  markAdminRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markAdminRead(req.params.id);
    res.json({ success: true });
  }),

  markAllAdminRead: asyncHandler(async (_req: Request, res: Response) => {
    await notificationsService.markAllAdminRead();
    res.json({ success: true });
  }),
};
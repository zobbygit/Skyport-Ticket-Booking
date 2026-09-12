import PDFDocument from "pdfkit";
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminService } from "./admin.service";
import { ApiError } from "../../utils/apiError";

export const adminController = {
  analytics: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await adminService.analytics() });
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await adminService.dashboardStats() });
  }),

  listAdmins: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await adminService.listAdmins() });
  }),

  createAdmin: asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) throw ApiError.badRequest("fullName, email, password, role are required.");
    const admin = await adminService.createAdmin(req.auth!.sub, req.body);
    res.status(201).json({ success: true, data: admin });
  }),

  setAdminActive: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.setAdminActive(req.auth!.sub, req.params.id, !!req.body.isActive);
    res.json({ success: true, data: admin });
  }),

  listPassengers: asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    res.json({ success: true, data: await adminService.listPassengers(page) });
  }),

  setPassengerActive: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.setPassengerActive(req.auth!.sub, req.params.id, !!req.body.isActive);
    res.json({ success: true, data: user });
  }),

  auditLogs: asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const action = req.query.action as string | undefined;
    res.json({ success: true, data: await adminService.listAuditLogs(page, 50, action) });
  }),

  exportAuditJson: asyncHandler(async (req: Request, res: Response) => {
    const action = req.query.action as string | undefined;
    const logs = await adminService.getAllAuditLogs(action);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="skyport-audit-${Date.now()}.json"`);
    res.json({ exported_at: new Date().toISOString(), total: logs.length, logs });
  }),

  exportAuditPdf: asyncHandler(async (req: Request, res: Response) => {
    const action = req.query.action as string | undefined;
    const logs = await adminService.getAllAuditLogs(action);

    const doc = new PDFDocument({ margin: 36, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="skyport-audit-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 56).fill("#1e293b");
    doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold").text("SkyPort — Audit Log", 36, 18);
    doc.fontSize(9).font("Helvetica").fillColor("#94a3b8")
      .text(`Exported ${new Date().toUTCString()} · ${logs.length} records`, 36, 40);
    doc.moveDown(3);

    // Column headers
    const COL = { time: 36, actor: 140, action: 270, entity: 400 };
    doc.fillColor("#64748b").fontSize(8).font("Helvetica-Bold");
    doc.text("TIME", COL.time, doc.y);
    doc.text("ACTOR", COL.actor, doc.y - 8);
    doc.text("ACTION", COL.action, doc.y - 8);
    doc.text("ENTITY", COL.entity, doc.y - 8);
    doc.moveDown(0.4);
    doc.moveTo(36, doc.y).lineTo(doc.page.width - 36, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.4);

    // Rows
    logs.forEach((log: any) => {
      if (doc.y > doc.page.height - 80) {
        doc.addPage();
        doc.moveDown(1);
      }
      const actorName =
        log.actor_admin?.full_name ||
        log.actor_user?.full_name ||
        log.actor_type || "System";
      const y = doc.y;
      doc.fillColor("#0f172a").fontSize(8).font("Helvetica");
      doc.text(new Date(log.created_at).toISOString().replace("T", " ").slice(0, 19), COL.time, y, { width: 98 });
      doc.text(actorName, COL.actor, y, { width: 124 });
      doc.text(log.action.replaceAll("_", " "), COL.action, y, { width: 124 });
      doc.text(log.entity_type, COL.entity, y, { width: 80 });
      doc.moveDown(0.6);
    });

    doc.end();
  }),
};
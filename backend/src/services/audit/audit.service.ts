import { pool } from "../../config/db";

export type AuditActorType = "admin" | "user" | "system";

interface LogEventInput {
  actorType: AuditActorType;
  actorAdminId?: string | null;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: object;
}

/**
 * Central audit logger. Every call is fire-and-forget from the caller's
 * perspective (errors are swallowed + logged) — a broken audit write must
 * never fail the request that triggered it (a login, a booking, etc).
 */
export const auditService = {
  async log(input: LogEventInput) {
    try {
      await pool.query(
        `INSERT INTO audit_logs (actor_admin_id, actor_user_id, actor_type, action, entity_type, entity_id, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          input.actorAdminId || null,
          input.actorUserId || null,
          input.actorType,
          input.action,
          input.entityType,
          input.entityId || null,
          JSON.stringify(input.metadata || {}),
        ]
      );
    } catch (e) {
      console.error("[audit] failed to log event", input.action, e);
    }
  },
};
import type { AuditLogEntry } from "@pharmasaas/domain";

export const auditLogTable: AuditLogEntry[] = [];

export const insertAuditLog = (entry: AuditLogEntry) => {
  auditLogTable.push(entry);
  return entry;
};

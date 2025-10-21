export type AuditLogEntry = {
  id: string;
  actorId: string;
  action: string;
  occurredAt: Date;
};

export const createAuditLogEntry = (input: AuditLogEntry): AuditLogEntry => {
  return input;
};

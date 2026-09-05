type AuditLogEntry = {
  id: number;
  actorType: "admin" | "creator" | "system";
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
};

export type { AuditLogEntry };
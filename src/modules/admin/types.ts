import { ADJUSTMENT_TYPES } from "./schema";

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

type CreatorOption = {
  id: string;
  username: string;
  displayName: string;
};

type AdjustmentType = (typeof ADJUSTMENT_TYPES)[number];
type PendingOperatorAction = "suspend" | "unsuspend" | "freeze" | "unfreeze";

type CreatorTipEntry = {
  id: string;
  amount: number;
  amountPaid: number | null;
  providerSettlementAmount: number | null;
  note: string | null;
  anonymous: boolean;
  tipperName: string | null;
  tipperEmail: string | null;
  paymentReference: string;
  providerReference: string | null;
  status: "pending" | "success" | "failed";
  createdAt: string;
};

export type {
  AuditLogEntry,
  CreatorOption,
  AdjustmentType,
  CreatorTipEntry,
  PendingOperatorAction,
};

import { AdjustmentType, PendingOperatorAction } from "./types";

const TYPE_OPTIONS: Array<{ value: AdjustmentType; label: string }> = [
  { value: "refund", label: "Refund (debit)" },
  { value: "reversal", label: "Reversal (debit)" },
  { value: "manual_debit", label: "Manual debit" },
  { value: "manual_credit", label: "Manual credit" },
];

const PENDING_OPERATOR_ACTION_LABELS: Record<
  PendingOperatorAction,
  { button: string; confirm: string }
> = {
  suspend: {
    button: "Suspend account",
    confirm: "Suspend — blocks tips, payouts, and the public page",
  },
  unsuspend: { button: "Lift suspension", confirm: "Lift the suspension" },
  freeze: {
    button: "Freeze payouts",
    confirm: "Freeze — blocks withdrawals only; tips keep landing",
  },
  unfreeze: { button: "Unfreeze payouts", confirm: "Unfreeze payouts" },
};

export { TYPE_OPTIONS, PENDING_OPERATOR_ACTION_LABELS };

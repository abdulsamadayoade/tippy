import { AdjustmentType } from "./types";

const TYPE_OPTIONS: Array<{ value: AdjustmentType; label: string }> = [
  { value: "refund", label: "Refund (debit)" },
  { value: "reversal", label: "Reversal (debit)" },
  { value: "manual_debit", label: "Manual debit" },
  { value: "manual_credit", label: "Manual credit" },
];

export { TYPE_OPTIONS };

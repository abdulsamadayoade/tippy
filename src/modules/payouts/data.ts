import type { PayoutStatus } from "@/types";
import type { BankAccount } from "@/types";

const STATUS_CHIPS: Record<PayoutStatus, { label: string; className: string }> =
  {
    paid: { label: "Paid", className: "bg-success-soft text-success" },
    pending: { label: "Pending", className: "bg-warning-soft text-warning" },
    processing: {
      label: "Processing",
      className: "bg-warning-soft text-warning",
    },
    failed: { label: "Failed", className: "bg-danger-soft text-danger" },
  };

const EMPTY_PAYOUT_FORM: BankAccount = {
  bank: "",
  accountName: "",
  accountNumber: "",
};

export { STATUS_CHIPS, EMPTY_PAYOUT_FORM };

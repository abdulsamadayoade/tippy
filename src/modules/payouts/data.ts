import type { PayoutStatus } from "@/types";

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

export { STATUS_CHIPS };

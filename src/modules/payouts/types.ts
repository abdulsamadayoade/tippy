import type { PayoutEnvironment } from "@/lib/payout-fees";
import type { BankAccount, Payout } from "@/types";

type PayoutDestination = { id: string; revision: number };

type PayoutsProps = {
  identityVerified: boolean;
  environment: PayoutEnvironment;
  destination: PayoutDestination | null;
  payoutBlockReason: string | null;
  balance: number;
  account: BankAccount | null;
  autoPayout: boolean;
  payouts: Payout[];
};

type BalanceBannerProps = {
  blockedReason: string | null;
  total: number;
  hasAccount: boolean;
  autoPayout: boolean;
  canWithdraw: boolean;
  withdrawalRequested: boolean;
  onWithdraw: () => void;
};

type PastPayoutsProps = {
  payouts: Payout[];
};

type WithdrawModalProps = {
  open: boolean;
  onClose: () => void;
  balance: number;
  account: BankAccount | null;
  destination: PayoutDestination | null;
  environment: PayoutEnvironment;
};

type PayoutAccountCardProps = {
  automaticPayoutBlocked: boolean;
  identityVerified: boolean;
  account: BankAccount | null;
  autoPayout: boolean;
};

type AccountMenuProps = {
  onEdit: () => void;
  onRemove: () => void;
};

type FormMode = "add" | "edit";

type FormErrors = {
  bank?: string;
  accountNumber?: string;
  accountName?: string;
};

export type {
  PayoutsProps,
  BalanceBannerProps,
  PastPayoutsProps,
  WithdrawModalProps,
  PayoutAccountCardProps,
  AccountMenuProps,
  FormErrors,
  FormMode,
};

import type { BankAccount, Payout } from "@/types";

type PayoutsProps = {
  balance: number;
  account: BankAccount | null;
  autoPayout: boolean;
  payouts: Payout[];
};

type BalanceBannerProps = {
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
};

type PayoutAccountCardProps = {
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

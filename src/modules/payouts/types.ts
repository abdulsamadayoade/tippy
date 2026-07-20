import type { BankAccount, Payout } from "@/store/types";

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
  requested: boolean;
  onConfirm: () => void;
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
  BalanceBannerProps,
  PastPayoutsProps,
  WithdrawModalProps,
  AccountMenuProps,
  FormErrors,
  FormMode,
};

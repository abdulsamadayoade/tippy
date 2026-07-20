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

export type { BalanceBannerProps, PastPayoutsProps, WithdrawModalProps };

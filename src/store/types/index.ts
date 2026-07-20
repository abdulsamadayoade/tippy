type Tip = {
  id: string;
  name: string;
  amount: number;
  note: string;
  anonymous: boolean;
  initial: string;
  shade: "strong" | "default" | "subtle";
  time: string;
  createdAt: string;
  reference: string;
};

type PayoutStatus = "pending" | "processing" | "paid" | "failed";

type Payout = {
  id: string;
  date: string;
  amount: number;
  status: PayoutStatus;
  reference: string;
};

type TipDraft = Pick<Tip, "amount" | "note" | "anonymous">;

type BankAccount = {
  bank: string;
  accountName: string;
  accountNumber: string;
};

export type { Tip, Payout, PayoutStatus, TipDraft, BankAccount };

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialPayoutAccount, initialTips } from "@/data";
import type { BankAccount, Tip } from "@/store/types";

type TipsContextValue = {
  tips: Tip[];
  addTip: (tip: Tip) => void;
};

type PayoutAccountContextValue = {
  account: BankAccount | null;
  saveAccount: (account: BankAccount) => void;
  removeAccount: () => void;
  autoPayout: boolean;
  setAutoPayout: (enabled: boolean) => void;
};

const TipsContext = createContext<TipsContextValue | null>(null);
const PayoutAccountContext = createContext<PayoutAccountContextValue | null>(
  null,
);

export function AppProviders({ children }: { children: ReactNode }) {
  const [tips, setTips] = useState<Tip[]>(initialTips);
  const [account, setAccount] = useState<BankAccount | null>(
    initialPayoutAccount,
  );
  const [autoPayout, setAutoPayout] = useState(true);

  const addTip = useCallback((tip: Tip) => {
    setTips((current) => [tip, ...current]);
  }, []);

  const saveAccount = useCallback((next: BankAccount) => {
    setAccount({
      bank: next.bank,
      accountName: next.accountName.trim(),
      accountNumber: next.accountNumber,
    });
  }, []);

  const removeAccount = useCallback(() => setAccount(null), []);

  const tipsValue = useMemo(() => ({ tips, addTip }), [addTip, tips]);
  const accountValue = useMemo(
    () => ({ account, saveAccount, removeAccount, autoPayout, setAutoPayout }),
    [account, removeAccount, saveAccount, autoPayout],
  );

  return (
    <TipsContext.Provider value={tipsValue}>
      <PayoutAccountContext.Provider value={accountValue}>
        {children}
      </PayoutAccountContext.Provider>
    </TipsContext.Provider>
  );
}

export function useTips() {
  const context = useContext(TipsContext);

  if (!context) {
    throw new Error("useTips must be used inside AppProviders");
  }

  return context;
}

export function usePayoutAccount() {
  const context = useContext(PayoutAccountContext);

  if (!context) {
    throw new Error("usePayoutAccount must be used inside AppProviders");
  }

  return context;
}

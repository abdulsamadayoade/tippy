type PayoutEnvironment = "sandbox" | "live";
const PAYOUT_FEE_POLICY_VERSION = "requested-amount-v1";

type PayoutQuote = {
  bankAmount: number;
  creatorFeeAmount: number;
  balanceDebit: number;
  environment: PayoutEnvironment;
  feePolicyVersion: string;
};

type WithdrawalQuote = PayoutQuote & {
  destinationId: string;
  destinationRevision: number;
  destinationBank: string;
  destinationLast4: string;
};

function toKobo(amount: number): number {
  const kobo = Math.round(amount * 100);
  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    !Number.isSafeInteger(kobo) ||
    kobo > 99_999_999_999_999 ||
    Math.abs(amount * 100 - kobo) > 1e-7
  ) {
    throw new Error(
      "Amount must be a non-negative value with at most 2 decimals.",
    );
  }
  return kobo;
}

function getMonnifyPayoutFee(
  requestedAmount: number,
  environment: PayoutEnvironment,
): number {
  const amount = toKobo(requestedAmount);
  if (amount === 0) return 0;
  if (environment === "sandbox") return 35;
  return amount < 1_000_000 ? 10 : amount < 5_000_000 ? 20 : 40;
}

function quotePayoutFromBalance(
  balanceAmount: number,
  environment: PayoutEnvironment,
): PayoutQuote {
  const budget = toKobo(balanceAmount);
  const creatorFeeAmount = getMonnifyPayoutFee(balanceAmount, environment);
  if (budget <= toKobo(creatorFeeAmount))
    throw new Error("Amount must cover the transfer fee.");
  return {
    bankAmount: (budget - toKobo(creatorFeeAmount)) / 100,
    creatorFeeAmount,
    balanceDebit: budget / 100,
    environment,
    feePolicyVersion: PAYOUT_FEE_POLICY_VERSION,
  };
}

function sameWithdrawalQuote(a: WithdrawalQuote, b: WithdrawalQuote): boolean {
  return (
    a.bankAmount === b.bankAmount &&
    a.creatorFeeAmount === b.creatorFeeAmount &&
    a.balanceDebit === b.balanceDebit &&
    a.environment === b.environment &&
    a.feePolicyVersion === b.feePolicyVersion &&
    a.destinationId === b.destinationId &&
    a.destinationRevision === b.destinationRevision &&
    a.destinationBank === b.destinationBank &&
    a.destinationLast4 === b.destinationLast4
  );
}

function parseProviderFee(body: {
  fee?: unknown;
  totalFee?: unknown;
}): number | null {
  const value = body.totalFee ?? body.fee;
  if (typeof value !== "number") return null;
  try {
    return toKobo(value) / 100;
  } catch {
    return null;
  }
}

function providerFeeDifference(creatorFee: number, actualFee: number): number {
  return (toKobo(actualFee) - toKobo(creatorFee)) / 100;
}

export {
  type PayoutEnvironment,
  type WithdrawalQuote,
  quotePayoutFromBalance,
  sameWithdrawalQuote,
  parseProviderFee,
  providerFeeDifference,
};

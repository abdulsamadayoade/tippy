import type { PayoutEnvironment } from "./payout-fees";

export function getPayoutEnvironment(): PayoutEnvironment {
  const url = new URL(
    process.env.MONNIFY_BASE_URL ?? "https://sandbox.monnify.com",
  );
  if (url.origin === "https://sandbox.monnify.com") return "sandbox";
  if (url.origin === "https://api.monnify.com") return "live";
  throw new Error("Unsupported Monnify environment.");
}

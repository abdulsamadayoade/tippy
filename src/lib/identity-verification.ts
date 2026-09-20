import type { PayoutEnvironment } from "./payout-fees";

type VerificationStatus = "unverified" | "verified" | "failed";
type VerificationResult = {
  status: "verified" | "failed" | "unavailable";
  providerReference: string | null;
};

const SANDBOX_IDENTITIES = {
  success: "00000000001",
  mismatch: "00000000002",
  unavailable: "00000000003",
};

function simulateVerification(bvn: string): VerificationResult {
  return {
    status:
      bvn === SANDBOX_IDENTITIES.success
        ? "verified"
        : bvn === SANDBOX_IDENTITIES.unavailable
          ? "unavailable"
          : "failed",
    providerReference: null,
  };
}

function isFullIdentityMatch(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;

  const envelope = payload as Record<string, unknown>;
  if (
    envelope.requestSuccessful !== true ||
    (envelope.responseCode !== undefined && envelope.responseCode !== "0")
  )
    return false;

  const body = envelope.responseBody;
  if (!body || typeof body !== "object") return false;

  const record = body as Record<string, unknown>;
  const { bvnAccountNameMatch, matchStatus, matchPercentage } = record;

  if (bvnAccountNameMatch !== undefined && bvnAccountNameMatch !== true)
    return false;
  if (matchStatus !== undefined && matchStatus !== "FULL_MATCH") return false;
  if (matchPercentage !== undefined && matchPercentage !== 100) return false;
  return bvnAccountNameMatch === true || matchStatus === "FULL_MATCH";
}

function isAccountVerified(
  account: {
    verificationStatus: string;
    verificationEnvironment: string | null;
    verificationRevision: number | null;
    revision: number;
    verifiedAt: Date | string | null;
  },
  environment: PayoutEnvironment,
): boolean {
  return (
    account.verificationStatus === "verified" &&
    account.verificationEnvironment === environment &&
    account.verificationRevision === account.revision &&
    account.verifiedAt !== null
  );
}

export {
  type VerificationResult,
  type VerificationStatus,
  simulateVerification,
  isFullIdentityMatch,
  isAccountVerified,
};

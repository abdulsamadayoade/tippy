import { reportError } from "@/lib/monitoring";

const SANDBOX_BASE_URL = "https://sandbox.monnify.com";

type MonnifyEnvelope<Body> = {
  requestSuccessful?: boolean;
  responseMessage?: string;
  responseBody?: Body;
};

type MonnifyAuthResponse = MonnifyEnvelope<{
  accessToken?: string;
  expiresIn?: number;
}>;

type MonnifyQueryResponse = MonnifyEnvelope<{
  paymentStatus?: string;
  amountPaid?: number;
  totalPayable?: number;
  transactionReference?: string;
  paymentReference?: string;
  paidOn?: string | null;
  paymentMethod?: string | null;
}>;

export type MonnifyTransaction = {
  paymentStatus: string;
  amountPaid: number;
  transactionReference: string;
  paymentReference: string;
  paidOn: string | null;
  paymentMethod: string | null;
};

export type MonnifyResolvedAccount = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
};

export type MonnifyTransfer = {
  reference: string;
  status: string;
  amount: number;
  completedOn: string | null;
};

export type MonnifyTransferOutcome = {
  status: "SUCCESS" | "PENDING" | "FAILED" | "OTP_REQUIRED";
  providerReference: string | null;
  failureReason: string | null;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} — add it to your environment.`);
  }
  return value;
}

export function getMonnifyConfig() {
  return {
    apiKey: requiredEnv("MONNIFY_API_KEY"),
    secretKey: requiredEnv("MONNIFY_SECRET_KEY"),
    contractCode: requiredEnv("MONNIFY_CONTRACT_CODE"),
    baseUrl: process.env.MONNIFY_BASE_URL ?? SANDBOX_BASE_URL,
  };
}

/** The merchant wallet transfers are funded from (Monnify dashboard → Wallet). */
export function getMonnifySourceAccount() {
  return requiredEnv("MONNIFY_SOURCE_ACCOUNT_NUMBER");
}

export function isMonnifySandbox() {
  return getMonnifyConfig().baseUrl.includes("sandbox");
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const { apiKey, secretKey, baseUrl } = getMonnifyConfig();
  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error(
      `Monnify authentication failed (${response.status}).`,
    );
    reportError(error, {
      category: "monnify.auth",
      tags: {
        httpStatus: response.status,
        monnifyEnv: baseUrl.includes("sandbox") ? "sandbox" : "live",
      },
      fingerprint: ["monnify-auth-failure"],
    });
    throw error;
  }

  const payload = (await response.json()) as MonnifyAuthResponse;
  const token = payload.responseBody?.accessToken;

  if (!payload.requestSuccessful || !token) {
    const error = new Error("Monnify authentication returned no access token.");
    reportError(error, {
      category: "monnify.auth",
      tags: { monnifyEnv: baseUrl.includes("sandbox") ? "sandbox" : "live" },
      fingerprint: ["monnify-auth-failure"],
    });
    throw error;
  }

  const expiresInSeconds = payload.responseBody?.expiresIn ?? 3600;
  cachedToken = {
    value: token,
    expiresAt: Date.now() + Math.max(expiresInSeconds - 60, 60) * 1000,
  };
  return token;
}

async function monnifyFetch(path: string, init: RequestInit = {}) {
  const { baseUrl } = getMonnifyConfig();
  const call = async () =>
    fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      cache: "no-store",
    });

  let response = await call();

  if (response.status === 401) {
    cachedToken = null;
    response = await call();
  }

  return response;
}

async function readEnvelope<Body>(response: Response) {
  return (await response
    .json()
    .catch(() => null)) as MonnifyEnvelope<Body> | null;
}

export async function getTransactionByPaymentReference(
  paymentReference: string,
): Promise<MonnifyTransaction | null> {
  const query = `paymentReference=${encodeURIComponent(paymentReference)}`;
  const response = await monnifyFetch(
    `/api/v2/merchant/transactions/query?${query}`,
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    const failure = await readEnvelope<never>(response);
    throw new Error(
      `Monnify transaction query failed (${response.status}): ${failure?.responseMessage ?? "unknown error"}`,
    );
  }

  const payload = (await response
    .json()
    .catch(() => null)) as MonnifyQueryResponse | null;
  const body = payload?.responseBody;

  if (
    !payload?.requestSuccessful ||
    !body?.paymentStatus ||
    !body.transactionReference ||
    !body.paymentReference
  ) {
    return null;
  }

  return {
    paymentStatus: body.paymentStatus,
    amountPaid: body.amountPaid ?? 0,
    transactionReference: body.transactionReference,
    paymentReference: body.paymentReference,
    paidOn: body.paidOn ?? null,
    paymentMethod: body.paymentMethod ?? null,
  };
}

export async function validateBankAccount(
  accountNumber: string,
  bankCode: string,
): Promise<MonnifyResolvedAccount | null> {
  const query = `accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`;
  const response = await monnifyFetch(
    `/api/v2/disbursements/account/validate?${query}`,
  );

  if (response.status >= 500) {
    throw new Error(`Monnify account validation failed (${response.status}).`);
  }

  const payload = await readEnvelope<{
    accountNumber?: string;
    accountName?: string;
    bankCode?: string;
  }>(response);
  const accountName = payload?.responseBody?.accountName?.trim();

  if (!response.ok || !payload?.requestSuccessful || !accountName) {
    return null;
  }

  return {
    accountNumber: payload.responseBody?.accountNumber ?? accountNumber,
    accountName,
    bankCode: payload.responseBody?.bankCode ?? bankCode,
  };
}

export async function getTransferByReference(
  reference: string,
): Promise<MonnifyTransfer | null> {
  const response = await monnifyFetch(
    `/api/v2/disbursements/single/summary?reference=${encodeURIComponent(reference)}`,
  );

  if (response.status === 404) return null;

  const payload = await readEnvelope<{
    reference?: string;
    status?: string;
    amount?: number;
    completedOn?: string | null;
  }>(response);

  if (!response.ok || !payload?.requestSuccessful) {
    const message = payload?.responseMessage ?? "";
    if (
      response.status < 500 &&
      /not.*found|does not exist|no transaction/i.test(message)
    ) {
      return null;
    }
    throw new Error(
      `Monnify transfer query failed (${response.status}): ${message || "unknown error"}`,
    );
  }

  const body = payload.responseBody;
  if (!body?.status) return null;

  return {
    reference: body.reference ?? reference,
    status: body.status,
    amount: body.amount ?? 0,
    completedOn: body.completedOn ?? null,
  };
}

/** Available balance (naira) of the disbursement wallet payouts draw from. */
export async function getWalletBalance(): Promise<number> {
  const accountNumber = getMonnifySourceAccount();
  const response = await monnifyFetch(
    `/api/v2/disbursements/wallet-balance?accountNumber=${encodeURIComponent(accountNumber)}`,
  );
  const payload = await readEnvelope<{ availableBalance?: number }>(response);
  const balance = payload?.responseBody?.availableBalance;

  if (
    !response.ok ||
    !payload?.requestSuccessful ||
    typeof balance !== "number"
  ) {
    throw new Error(
      `Monnify wallet balance query failed (${response.status}): ${payload?.responseMessage ?? "unknown error"}`,
    );
  }
  return balance;
}

export async function initiateTransfer(request: {
  amount: number;
  reference: string;
  narration: string;
  destinationBankCode: string;
  destinationAccountNumber: string;
  destinationAccountName: string;
}): Promise<MonnifyTransferOutcome> {
  const response = await monnifyFetch("/api/v2/disbursements/single", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...request,
      currency: "NGN",
      sourceAccountNumber: getMonnifySourceAccount(),
    }),
  });

  if (response.status >= 500) {
    throw new Error(`Monnify transfer initiation failed (${response.status}).`);
  }

  const payload = await readEnvelope<{
    status?: string;
    reference?: string;
    transactionReference?: string;
  }>(response);
  const message = payload?.responseMessage ?? `HTTP ${response.status}`;

  if (!response.ok || !payload?.requestSuccessful) {
    if (/duplicate|already exist/i.test(message)) {
      const existing = await getTransferByReference(request.reference);
      if (existing) {
        return {
          status:
            existing.status === "SUCCESS"
              ? "SUCCESS"
              : /FAILED|REVERSED|EXPIRED|CANCELLED/.test(existing.status)
                ? "FAILED"
                : "PENDING",
          providerReference: null,
          failureReason:
            existing.status === "SUCCESS"
              ? null
              : `Provider status: ${existing.status}`,
        };
      }
    }

    return {
      status: "FAILED",
      providerReference: null,
      failureReason: `Monnify rejected the transfer: ${message}`,
    };
  }

  const status = payload.responseBody?.status ?? "PENDING";
  const providerReference =
    payload.responseBody?.transactionReference ??
    payload.responseBody?.reference ??
    null;

  if (status === "PENDING_AUTHORIZATION") {
    return {
      status: "OTP_REQUIRED",
      providerReference,
      failureReason:
        "Transfer OTP authorization is enabled on the Monnify dashboard — disable 2FA for API transfers.",
    };
  }

  if (status === "FAILED") {
    return { status: "FAILED", providerReference, failureReason: message };
  }

  return {
    status: status === "SUCCESS" ? "SUCCESS" : "PENDING",
    providerReference,
    failureReason: null,
  };
}

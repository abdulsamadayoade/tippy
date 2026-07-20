const SANDBOX_BASE_URL = "https://sandbox.monnify.com";

type MonnifyAuthResponse = {
  requestSuccessful?: boolean;
  responseBody?: { accessToken?: string; expiresIn?: number };
};

type MonnifyQueryResponse = {
  requestSuccessful?: boolean;
  responseBody?: {
    paymentStatus?: string;
    amountPaid?: number;
    totalPayable?: number;
    transactionReference?: string;
    paymentReference?: string;
    paidOn?: string | null;
    paymentMethod?: string | null;
  };
};

export type MonnifyTransaction = {
  paymentStatus: string;
  amountPaid: number;
  transactionReference: string;
  paymentReference: string;
  paidOn: string | null;
  paymentMethod: string | null;
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
    throw new Error(`Monnify authentication failed (${response.status}).`);
  }

  const payload = (await response.json()) as MonnifyAuthResponse;
  const token = payload.responseBody?.accessToken;

  if (!payload.requestSuccessful || !token) {
    throw new Error("Monnify authentication returned no access token.");
  }

  const expiresInSeconds = payload.responseBody?.expiresIn ?? 3600;
  cachedToken = {
    value: token,
    expiresAt: Date.now() + Math.max(expiresInSeconds - 60, 60) * 1000,
  };
  return token;
}

/**
 * Authoritative transaction lookup by our own payment reference. Returns null
 * when Monnify doesn't know the reference (e.g. checkout closed before the
 * transaction was initialised).
 */
export async function getTransactionByPaymentReference(
  paymentReference: string,
): Promise<MonnifyTransaction | null> {
  const { baseUrl } = getMonnifyConfig();
  const query = `paymentReference=${encodeURIComponent(paymentReference)}`;
  const url = `${baseUrl}/api/v2/merchant/transactions/query?${query}`;

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${await getAccessToken()}` },
    cache: "no-store",
  });

  // A cached token can be revoked server-side before our expiry margin hits.
  if (response.status === 401) {
    cachedToken = null;
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${await getAccessToken()}` },
      cache: "no-store",
    });
  }

  if (response.status === 404) return null;

  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as {
      responseMessage?: string;
    } | null;
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

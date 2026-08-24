import * as Sentry from "@sentry/nextjs";

export type ErrorCategory =
  | "monnify.auth"
  | "bank.verification"
  | "tip.settlement"
  | "webhook.settlement"
  | "payout.initiation"
  | "payout.reconciliation"
  | "payout.auto"
  | "email.resend"
  | "db.connection"
  | "db.health"
  | "cron.config"
  | "checkout.start"
  | "webhook.signature"
  | "wallet.balance"
  | "monitor.sweep";

type ReportOptions = {
  category: ErrorCategory;
  tags?: Record<string, string | number | boolean>;
  /** Whitelisted, non-sensitive values ONLY — never raw request/response
   *  objects, account numbers, emails, tokens, or Monnify payloads. */
  extra?: Record<string, unknown>;
  fingerprint?: string[];
};

/** console.error + Sentry in one call so no site can forget one half. */
export function reportError(error: unknown, options: ReportOptions): void {
  console.error(`[${options.category}]`, error);
  Sentry.captureException(error, {
    tags: { category: options.category, ...options.tags },
    extra: options.extra,
    ...(options.fingerprint ? { fingerprint: options.fingerprint } : {}),
  });
}

export function reportWarning(message: string, options: ReportOptions): void {
  console.warn(`[${options.category}]`, message);
  Sentry.captureMessage(message, {
    level: "warning",
    tags: { category: options.category, ...options.tags },
    extra: options.extra,
    ...(options.fingerprint ? { fingerprint: options.fingerprint } : {}),
  });
}

export function resolveSentryEnvironment(): "local" | "staging" | "production" {
  const override = process.env.SENTRY_ENVIRONMENT;
  if (
    override === "local" ||
    override === "staging" ||
    override === "production"
  ) {
    return override;
  }
  const vercelEnv =
    process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "staging";
  return "local";
}

const REDACTIONS: Array<[RegExp, string]> = [
  [/(accountNumber["'=:\s]+)\d+/gi, "$1[redacted]"],
  [/(sourceAccountNumber["'=:\s]+)\d+/gi, "$1[redacted]"],
  [/Basic\s+[A-Za-z0-9+/=]+/g, "Basic [redacted]"],
  [/Bearer\s+[\w.\-]+/g, "Bearer [redacted]"],
  [/([?&]token=)[^&\s"']+/gi, "$1[redacted]"],
  [/postgres(?:ql)?:\/\/[^@\s]+@/gi, "postgresql://[redacted]@"],
];

function scrubText(value: string): string {
  return REDACTIONS.reduce((acc, [re, sub]) => acc.replace(re, sub), value);
}

const SENSITIVE_KEY =
  /account_?(number|name)|token|secret|password|api_?key|authorization|credential|database_?url|connection|email|tipper_?name|^note$|raw_?body/i;

function scrubValue(value: unknown, key = "", depth = 0): unknown {
  if (depth > 6) return "[redacted: too deep]";
  if (key && SENSITIVE_KEY.test(key)) return "[redacted]";
  if (typeof value === "string") return scrubText(value);
  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, key, depth + 1));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        scrubValue(childValue, childKey, depth + 1),
      ]),
    );
  }
  return value;
}

/** beforeSend: secrets, credentials, and account numbers must never leave
 *  the process, whatever surface of the event they end up on. */
export function scrubEvent<E extends Sentry.ErrorEvent>(event: E): E {
  if (event.request?.headers) {
    delete event.request.headers["authorization"];
    delete event.request.headers["Authorization"];
    delete event.request.headers["cookie"];
    delete event.request.headers["Cookie"];
  }
  if (event.request?.url) {
    event.request.url = scrubText(event.request.url);
  }
  if (typeof event.request?.query_string === "string") {
    event.request.query_string = scrubText(event.request.query_string);
  }
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = scrubText(exception.value);
  }
  if (event.message) event.message = scrubText(event.message);
  for (const crumb of event.breadcrumbs ?? []) {
    if (crumb.message) crumb.message = scrubText(crumb.message);
    if (typeof crumb.data?.url === "string") {
      crumb.data.url = scrubText(crumb.data.url);
    }
  }
  if (event.extra) {
    event.extra = scrubValue(event.extra) as typeof event.extra;
  }
  if (event.tags) {
    event.tags = scrubValue(event.tags) as typeof event.tags;
  }
  if (event.contexts) {
    event.contexts = scrubValue(event.contexts) as typeof event.contexts;
  }
  return event;
}

/** beforeBreadcrumb: outgoing fetch/http breadcrumbs lose their query string
 *  entirely — bank validation puts the full account number in the query, and
 *  no query string here is diagnostic. */
export function sanitizeBreadcrumb(
  breadcrumb: Sentry.Breadcrumb,
): Sentry.Breadcrumb | null {
  if (
    (breadcrumb.category === "fetch" || breadcrumb.category === "http") &&
    typeof breadcrumb.data?.url === "string"
  ) {
    breadcrumb.data.url = breadcrumb.data.url.split("?")[0];
  }
  return breadcrumb;
}

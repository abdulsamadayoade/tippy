import * as Sentry from "@sentry/nextjs";

export type ErrorCategory =
  | "monnify.auth"
  | "bank.verification"
  | "identity.verification"
  | "tip.settlement"
  | "tip.notification"
  | "webhook.settlement"
  | "payout.initiation"
  | "payout.reconciliation"
  | "payout.auto"
  | "payout.notification"
  | "email.resend"
  | "db.connection"
  | "cron.config"
  | "checkout.start"
  | "webhook.signature"
  | "wallet.balance"
  | "monitor.sweep"
  | "avatar.upload"
  | "avatar.delete"
  | "abuse.report"
  | "admin.auth"
  | "admin.action"
  | "admin.export"
  | "audit.write"
  | "webhook.persistence";

type ReportOptions = {
  category: ErrorCategory;
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, unknown>;
  fingerprint?: string[];
};

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
  [/\b\d{11}\b/g, "[redacted identity]"],
  [/((?:bvn|nin)["'=:\s]+)[^\s,}]+/gi, "$1[redacted]"],
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
  /bvn|nin|identity|account_?(number|name)|token|secret|password|api_?key|authorization|credential|database_?url|connection|email|tipper_?name|^note$|raw_?body/i;

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

export function scrubEvent<E extends Sentry.ErrorEvent>(event: E): E {
  if (event.request?.headers) {
    delete event.request.headers["authorization"];
    delete event.request.headers["Authorization"];
    delete event.request.headers["cookie"];
    delete event.request.headers["Cookie"];
  }
  if (event.request?.data) event.request.data = scrubValue(event.request.data);
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
    if (crumb.data) crumb.data = scrubValue(crumb.data) as typeof crumb.data;
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

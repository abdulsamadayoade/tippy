import * as Sentry from "@sentry/nextjs";
import {
  resolveSentryEnvironment,
  sanitizeBreadcrumb,
  scrubEvent,
} from "./src/lib/monitoring";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: resolveSentryEnvironment(),
  // Errors only: no tracesSampleRate (tracing off), no replay, and no
  // localVariablesIntegration — catch-frame locals at Monnify/payout sites
  // hold full account numbers and API keys.
  sendDefaultPii: false,
  beforeSend: scrubEvent,
  beforeBreadcrumb: sanitizeBreadcrumb,
});

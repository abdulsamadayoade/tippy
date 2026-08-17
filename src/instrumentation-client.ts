import * as Sentry from "@sentry/nextjs";
import {
  resolveSentryEnvironment,
  sanitizeBreadcrumb,
  scrubEvent,
} from "@/lib/monitoring";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: resolveSentryEnvironment(),
  // Errors only — no tracing, no session replay (replay would record the
  // supporter checkout and bank-account forms).
  sendDefaultPii: false,
  beforeSend: scrubEvent,
  beforeBreadcrumb: sanitizeBreadcrumb,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

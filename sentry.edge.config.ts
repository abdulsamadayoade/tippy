import * as Sentry from "@sentry/nextjs";
import { resolveSentryEnvironment, scrubEvent } from "./src/lib/monitoring";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: resolveSentryEnvironment(),
  sendDefaultPii: false,
  beforeSend: scrubEvent,
});

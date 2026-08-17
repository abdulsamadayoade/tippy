import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    staleTimes: { dynamic: 30 },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "tippy",
  project: process.env.SENTRY_PROJECT ?? "tippy",
  // Absent locally → the build warns but still succeeds (Husky pre-push safe).
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Supporters run ad-blockers; proxy client events through the app.
  // (The cron monitor is registered at runtime via Sentry.withMonitor in
  // /api/cron/payouts — automaticVercelMonitors is webpack-only.)
  tunnelRoute: true,
});

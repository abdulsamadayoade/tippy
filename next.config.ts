import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/offline.html",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  experimental: {
    staleTimes: { dynamic: 30 },
    serverActions: { bodySizeLimit: "5mb" },
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
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Supporters run ad-blockers; proxy client events through the app.
  // (The cron monitor is registered at runtime via Sentry.withMonitor in
  // /api/cron/payouts — automaticVercelMonitors is webpack-only.)
  tunnelRoute: true,
});

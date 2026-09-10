export const SITE_URL = process.env.BETTER_AUTH_URL ?? "https://www.tippy.cash";

export function isProductionSite(): boolean {
  return (
    (process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV) ===
    "production"
  );
}

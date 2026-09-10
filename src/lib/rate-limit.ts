import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type RateLimitRule = { window: number; max: number };
export type RateLimitDecision = { allowed: boolean; retryAfter: number | null };

const RATE_LIMIT_RETENTION_MS = 60 * 60 * 1000;

export async function consumeRateLimit(
  key: string,
  { window, max }: RateLimitRule,
): Promise<RateLimitDecision> {
  const windowMs = window * 1000;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;

  const result = await db.execute(sql`
    INSERT INTO rate_limit ("key", "count", "window_start")
    VALUES (${key}, 1, ${windowStart})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN rate_limit."window_start" = ${windowStart} THEN rate_limit."count" + 1
        ELSE 1
      END,
      "window_start" = ${windowStart}
    RETURNING "count"
  `);

  const count = Number(result.rows[0]?.count ?? 0);

  if (count <= max) return { allowed: true, retryAfter: null };

  const retryAfter = Math.max(
    1,
    Math.ceil((windowStart + windowMs - Date.now()) / 1000),
  );
  return { allowed: false, retryAfter };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

export async function pruneRateLimits(): Promise<void> {
  await db.execute(sql`
    DELETE FROM rate_limit
    WHERE "window_start" < ${Date.now() - RATE_LIMIT_RETENTION_MS}
  `);
}

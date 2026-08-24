import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";
import { reportError } from "@/lib/monitoring";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
  reportError(error, {
    category: "db.connection",
    fingerprint: ["pg-pool-idle-client-error"],
  });
});

export const db = drizzle(pool, { schema: { ...schema, ...authSchema } });

export const LOCK_KEYS = {
  autoPayouts: 727001,
  monitorSweep: 727002,
} as const;

export async function withAdvisoryLock<T>(
  key: number,
  fn: () => Promise<T>,
): Promise<{ acquired: false } | { acquired: true; result: T }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_xact_lock($1) AS locked",
      [key],
    );
    if (!rows[0]?.locked) return { acquired: false };
    return { acquired: true, result: await fn() };
  } finally {
    await client.query("COMMIT").catch(() => undefined);
    client.release();
  }
}

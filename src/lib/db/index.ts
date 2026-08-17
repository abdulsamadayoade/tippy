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

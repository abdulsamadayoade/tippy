import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function checkDatabase(timeoutMs: number = 5_000): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(`Database health check timed out after ${timeoutMs}ms`),
        ),
      timeoutMs,
    );
  });

  try {
    await Promise.race([db.execute(sql`SELECT 1`), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

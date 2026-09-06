/**
 * Grants the admin role to an existing user by email:
 *
 *   npm run admin:create -- someone@example.com
 *
 * The user must have signed in at least once (magic link creates the row).
 * They complete TOTP enrollment themselves at /admin/verify.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { user } from "../src/lib/db/auth-schema";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    console.error("Usage: npm run admin:create -- <email>");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const updated = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id, email: user.email });

  await pool.end();

  if (updated.length === 0) {
    console.error(
      `No user found for ${email}. They need to sign in once first.`,
    );
    process.exit(1);
  }

  console.log(`${updated[0].email} is now an admin (user ${updated[0].id}).`);
  console.log("Next: they sign in and finish TOTP setup at /admin/verify.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

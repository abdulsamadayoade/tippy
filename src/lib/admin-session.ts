import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminMfaVerification } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

const MFA_FRESHNESS_MS = 12 * 60 * 60 * 1000;

type SessionData = NonNullable<Awaited<ReturnType<typeof getSession>>>;

export type AdminGate =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "enrollment-required"; session: SessionData }
  | { status: "mfa-required"; session: SessionData }
  | { status: "ok"; session: SessionData };

export async function checkAdminAccess(): Promise<AdminGate> {
  const session = await getSession();
  if (!session) return { status: "unauthenticated" };

  const user = session.user as SessionData["user"] & {
    role?: string | null;
    banned?: boolean | null;
    twoFactorEnabled?: boolean | null;
  };

  if (user.role !== "admin" || user.banned) return { status: "forbidden" };

  if (!user.twoFactorEnabled) {
    return { status: "enrollment-required", session };
  }

  const verification = await db.query.adminMfaVerification.findFirst({
    where: eq(adminMfaVerification.sessionId, session.session.id),
  });

  const fresh =
    verification &&
    Date.now() - verification.verifiedAt.getTime() < MFA_FRESHNESS_MS;

  if (!fresh) return { status: "mfa-required", session };

  return { status: "ok", session };
}

export async function requireAdminForAction(): Promise<
  | { error: string }
  | { session: SessionData; ip: string | null; userAgent: string | null }
> {
  const gate = await checkAdminAccess();
  if (gate.status !== "ok") {
    return { error: "Not authorized." };
  }

  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");

  return {
    session: gate.session,
    ip: forwardedFor?.split(",")[0]?.trim() ?? null,
    userAgent: headerList.get("user-agent"),
  };
}

export async function recordMfaVerification(
  sessionId: string,
  userId: string,
): Promise<void> {
  await db
    .insert(adminMfaVerification)
    .values({ sessionId, userId })
    .onConflictDoUpdate({
      target: adminMfaVerification.sessionId,
      set: { verifiedAt: new Date() },
    });
}

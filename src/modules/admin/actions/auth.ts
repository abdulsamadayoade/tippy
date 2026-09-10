"use server";

import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reportError } from "@/lib/monitoring";
import { session as sessionTable } from "@/lib/db/auth-schema";
import { checkAdminAccess, recordMfaVerification } from "@/lib/admin-session";
import { writeAuditSafe } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/rate-limit";

const GENERIC_CODE_ERROR = "That code didn’t work. Try again.";

export async function startTotpEnrollment(): Promise<
  | { error: string }
  | { qrDataUrl: string; secret: string; backupCodes: string[] }
> {
  const gate = await checkAdminAccess();
  if (gate.status !== "enrollment-required") {
    return { error: "Not authorized." };
  }

  try {
    const result = await auth.api.enableTwoFactor({
      body: {},
      headers: await headers(),
    });

    const secret =
      new URL(result.totpURI).searchParams.get("secret") ?? "unavailable";

    return {
      qrDataUrl: await QRCode.toDataURL(result.totpURI, { margin: 1 }),
      secret,
      backupCodes: result.backupCodes,
    };
  } catch (error) {
    reportError(error, {
      category: "admin.auth",
      extra: { step: "enroll" },
    });
    return { error: "Couldn’t start enrollment. Try again." };
  }
}

export async function verifyAdminTotp(
  code: string,
): Promise<{ error?: string }> {
  return verifySecondFactor(code, "totp");
}

export async function verifyAdminBackupCode(
  code: string,
): Promise<{ error?: string }> {
  return verifySecondFactor(code, "backup-code");
}

async function verifySecondFactor(
  code: string,
  kind: "totp" | "backup-code",
): Promise<{ error?: string }> {
  const gate = await checkAdminAccess();
  if (
    gate.status === "unauthenticated" ||
    gate.status === "forbidden" ||
    (kind === "backup-code" && gate.status === "enrollment-required")
  ) {
    return { error: "Not authorized." };
  }

  const trimmed = code.trim().replace(/\s+/g, "");
  if (!trimmed) return { error: "Enter a code." };

  const userId = gate.session.user.id;
  const limit = await consumeRateLimit(`admin:totp:${userId}`, {
    window: 300,
    max: 5,
  });
  if (!limit.allowed) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const wasEnrolling = gate.status === "enrollment-required";
  const headerList = await headers();

  let token: string | null | undefined;
  try {
    if (kind === "totp") {
      const result = await auth.api.verifyTOTP({
        body: { code: trimmed },
        headers: headerList,
      });
      token = result.token;
    } else {
      const result = await auth.api.verifyBackupCode({
        body: { code: trimmed },
        headers: headerList,
      });
      token = result.token;
    }
  } catch {
    return { error: GENERIC_CODE_ERROR };
  }

  const sessionRow =
    (token
      ? await db.query.session.findFirst({
          where: eq(sessionTable.token, token),
          columns: { id: true },
        })
      : null) ??
    (await db.query.session.findFirst({
      where: eq(sessionTable.userId, userId),
      orderBy: [desc(sessionTable.createdAt)],
      columns: { id: true },
    }));

  if (!sessionRow) {
    return { error: "Your session expired. Sign in and try again." };
  }

  await recordMfaVerification(sessionRow.id, userId);

  await writeAuditSafe(db, {
    actorType: "admin",
    actorUserId: userId,
    action: wasEnrolling ? "admin.mfa_enrolled" : "admin.mfa_verified",
    targetType: "user",
    targetId: userId,
    details: { factor: kind },
    ip: headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: headerList.get("user-agent"),
  });

  return {};
}

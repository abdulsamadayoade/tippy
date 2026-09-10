import { Resend } from "resend";
import { reportError } from "@/lib/monitoring";
import { SITE_URL } from "@/lib/site";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Tippy <login@tippy.cash>";
const APP_URL = SITE_URL;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "hello@tippy.cash";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatEmailAmount(amount: number) {
  return `NGN ${amount.toLocaleString("en-NG")}`;
}

function magicLinkHtml(url: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background-color:#ffffff;border-radius:18px;padding:36px 32px;">
            <tr>
              <td align="left" style="font-size:20px;font-weight:700;color:#064e5b;padding-bottom:20px;">tippy.</td>
            </tr>
            <tr>
              <td style="font-size:19px;font-weight:600;color:#0b2239;padding-bottom:10px;">Sign in to Tippy</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.55;color:#274c5e;padding-bottom:24px;">
                Tap the button below to finish signing in. This link expires in
                5 minutes and can only be used once.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${url}" style="display:block;background-color:#064e5b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 24px;border-radius:999px;text-align:center;">
                  Sign in to Tippy
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:1.55;color:#5b7280;">
                If the button doesn&rsquo;t work, copy and paste this link into
                your browser:<br />
                <a href="${url}" style="color:#064e5b;word-break:break-all;">${url}</a>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
            <tr>
              <td style="font-size:12px;line-height:1.55;color:#7f7f7f;padding:20px 8px 0;">
                You&rsquo;re receiving this because someone entered your email on
                tippy.cash. If it wasn&rsquo;t you, you can safely ignore this
                email &mdash; nothing happens without the link. Tippy is
                operated by Nightshift Industries.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendMagicLinkEmail({
  email,
  url,
  token,
}: {
  email: string;
  url: string;
  token: string;
}) {
  const { error } = await resend.emails.send(
    {
      from: EMAIL_FROM,
      to: [email],
      subject: "Your one-tap sign-in link",
      html: magicLinkHtml(url),
      text: `Sign in to Tippy: ${url}\n\nThis link expires in 5 minutes and can only be used once. If you didn't request it, you can safely ignore this email.\n\nTippy is operated by Nightshift Industries.`,
    },
    { idempotencyKey: `magic-link/${token}` },
  );

  if (error) {
    const failure = new Error(`Magic link email failed: ${error.message}`);
    reportError(failure, {
      category: "email.resend",
      tags: { resendErrorName: error.name },
    });
    throw failure;
  }
}

function noteBlockHtml(note: string, caption: string) {
  return `<tr>
              <td style="padding-bottom:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;border-radius:12px;">
                  <tr>
                    <td style="font-size:14px;line-height:1.55;color:#274c5e;padding:14px 16px;">
                      &ldquo;${escapeHtml(note)}&rdquo;<br />
                      <span style="font-size:12px;color:#7f7f7f;">${caption}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

function tipReceivedHtml({
  tipperDisplayName,
  amount,
  note,
}: {
  tipperDisplayName: string;
  amount: number;
  note: string | null;
}) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background-color:#ffffff;border-radius:18px;padding:36px 32px;">
            <tr>
              <td align="left" style="font-size:20px;font-weight:700;color:#064e5b;padding-bottom:20px;">tippy.</td>
            </tr>
            <tr>
              <td style="font-size:19px;font-weight:600;color:#0b2239;padding-bottom:10px;">You received a tip</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.55;color:#274c5e;padding-bottom:24px;">
                <strong>${escapeHtml(tipperDisplayName)}</strong> sent you
                <strong style="color:#064e5b;">${formatEmailAmount(amount)}</strong>.
              </td>
            </tr>
            ${note ? noteBlockHtml(note, "They sent a note too") : ""}
            <tr>
              <td align="center">
                <a href="${APP_URL}/overview" style="display:block;background-color:#064e5b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 24px;border-radius:999px;text-align:center;">
                  View your dashboard
                </a>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
            <tr>
              <td style="font-size:12px;line-height:1.55;color:#7f7f7f;padding:20px 8px 0;">
                You&rsquo;re receiving this because you have a creator page on
                tippy.cash. Tippy is operated by Nightshift Industries.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function tipReceiptHtml({
  creatorDisplayName,
  creatorUsername,
  amount,
  note,
  paymentReference,
}: {
  creatorDisplayName: string;
  creatorUsername: string;
  amount: number;
  note: string | null;
  paymentReference: string;
}) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background-color:#ffffff;border-radius:18px;padding:36px 32px;">
            <tr>
              <td align="left" style="font-size:20px;font-weight:700;color:#064e5b;padding-bottom:20px;">tippy.</td>
            </tr>
            <tr>
              <td style="font-size:19px;font-weight:600;color:#0b2239;padding-bottom:10px;">Your tip to ${escapeHtml(creatorDisplayName)}</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.55;color:#274c5e;padding-bottom:24px;">
                Your <strong style="color:#064e5b;">${formatEmailAmount(amount)}</strong>
                tip to ${escapeHtml(creatorDisplayName)} went through. Thanks for
                the support.
              </td>
            </tr>
            ${note ? noteBlockHtml(note, "Your note was sent too") : ""}
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${APP_URL}/${creatorUsername}" style="display:block;background-color:#064e5b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 24px;border-radius:999px;text-align:center;">
                  Tip ${escapeHtml(creatorDisplayName)} again
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:1.55;color:#5b7280;">
                Receipt no. ${escapeHtml(paymentReference)}
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
            <tr>
              <td style="font-size:12px;line-height:1.55;color:#7f7f7f;padding:20px 8px 0;">
                You&rsquo;re receiving this because you asked for a receipt when
                sending a tip on tippy.cash. Tippy is operated by Nightshift
                Technologies.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendTipReceivedEmail({
  to,
  tipperDisplayName,
  amount,
  note,
  paymentReference,
}: {
  to: string;
  tipperDisplayName: string;
  amount: number;
  note: string | null;
  paymentReference: string;
}) {
  const { error } = await resend.emails.send(
    {
      from: EMAIL_FROM,
      to: [to],
      subject: `You received a ${formatEmailAmount(amount)} tip`,
      html: tipReceivedHtml({
        tipperDisplayName,
        amount,
        note,
      }),
      text: `${tipperDisplayName} sent you ${formatEmailAmount(amount)}.${note ? `\n\nTheir note: “${note}”` : ""}\n\nSee it on your dashboard: ${APP_URL}/overview\n\nTippy is operated by Nightshift Industries.`,
      tags: [{ name: "kind", value: "tip-received" }],
    },
    { idempotencyKey: `tip-received/${paymentReference}` },
  );

  if (error) {
    reportError(new Error(`Tip notification email failed: ${error.message}`), {
      category: "email.resend",
      tags: { kind: "tip-received", resendErrorName: error.name },
    });
  }
}

export async function sendTipReceiptEmail({
  to,
  creatorDisplayName,
  creatorUsername,
  amount,
  note,
  paymentReference,
}: {
  to: string;
  creatorDisplayName: string;
  creatorUsername: string;
  amount: number;
  note: string | null;
  paymentReference: string;
}) {
  const { error } = await resend.emails.send(
    {
      from: EMAIL_FROM,
      to: [to],
      subject: `Your ${formatEmailAmount(amount)} tip to ${creatorDisplayName}`,
      html: tipReceiptHtml({
        creatorDisplayName,
        creatorUsername,
        amount,
        note,
        paymentReference,
      }),
      text: `Your ${formatEmailAmount(amount)} tip to ${creatorDisplayName} went through. Thanks for the support.${note ? `\n\nYour note: “${note}”` : ""}\n\nReceipt no. ${paymentReference}\nTip ${creatorDisplayName} again: ${APP_URL}/${creatorUsername}\n\nTippy is operated by Nightshift Industries.`,
      tags: [{ name: "kind", value: "tip-receipt" }],
    },
    { idempotencyKey: `tip-receipt/${paymentReference}` },
  );

  if (error) {
    reportError(new Error(`Tip receipt email failed: ${error.message}`), {
      category: "email.resend",
      tags: { kind: "tip-receipt", resendErrorName: error.name },
    });
  }
}

function payoutPaidHtml({
  amount,
  bankName,
  maskedAccount,
  paymentReference,
}: {
  amount: number;
  bankName: string;
  maskedAccount: string;
  paymentReference: string;
}) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background-color:#ffffff;border-radius:18px;padding:36px 32px;">
            <tr>
              <td align="left" style="font-size:20px;font-weight:700;color:#064e5b;padding-bottom:20px;">tippy.</td>
            </tr>
            <tr>
              <td style="font-size:19px;font-weight:600;color:#0b2239;padding-bottom:10px;">Your payout is on the way</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.55;color:#274c5e;padding-bottom:24px;">
                <strong style="color:#064e5b;">${formatEmailAmount(amount)}</strong>
                is on its way to your ${escapeHtml(bankName)} account
                ${maskedAccount}. Bank transfers usually land within minutes.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${APP_URL}/payouts" style="display:block;background-color:#064e5b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 24px;border-radius:999px;text-align:center;">
                  View your payouts
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:1.55;color:#5b7280;">
                Reference: ${escapeHtml(paymentReference)}
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
            <tr>
              <td style="font-size:12px;line-height:1.55;color:#7f7f7f;padding:20px 8px 0;">
                You&rsquo;re receiving this because you have a creator page on
                tippy.cash. Tippy is operated by Nightshift Industries.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPayoutPaidEmail({
  to,
  amount,
  bankName,
  accountNumber,
  paymentReference,
}: {
  to: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  paymentReference: string;
}) {
  const maskedAccount = `**** ${accountNumber.slice(-4)}`;

  const { error } = await resend.emails.send(
    {
      from: EMAIL_FROM,
      to: [to],
      subject: `Your ${formatEmailAmount(amount)} payout is on the way`,
      html: payoutPaidHtml({
        amount,
        bankName,
        maskedAccount,
        paymentReference,
      }),
      text: `Your ${formatEmailAmount(amount)} payout is on its way to your ${bankName} account ${maskedAccount}. Bank transfers usually land within minutes.\n\nReference: ${paymentReference}\nView your payouts: ${APP_URL}/payouts\n\nTippy is operated by Nightshift Industries.`,
      tags: [{ name: "kind", value: "payout-paid" }],
    },
    { idempotencyKey: `payout-paid/${paymentReference}` },
  );

  if (error) {
    reportError(new Error(`Payout paid email failed: ${error.message}`), {
      category: "email.resend",
      tags: { kind: "payout-paid", resendErrorName: error.name },
    });
  }
}

function internalRelayHtml(rows: [string, string][]) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;padding:24px 16px;">
      ${rows
        .map(
          ([label, value]) => `<tr>
        <td style="font-size:12px;font-weight:600;color:#5b7280;padding:6px 16px 6px 0;vertical-align:top;white-space:nowrap;">${label}</td>
        <td style="font-size:14px;line-height:1.55;color:#0b2239;padding:6px 0;">${escapeHtml(value)}</td>
      </tr>`,
        )
        .join("\n      ")}
    </table>
  </body>
</html>`;
}

export async function sendSupportRequestEmail({
  name,
  email,
  topic,
  message,
}: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [SUPPORT_EMAIL],
    replyTo: email,
    subject: `[Support] ${topic} — ${name || email}`,
    html: internalRelayHtml([
      ["From", name ? `${name} <${email}>` : email],
      ["Topic", topic],
      ["Message", message],
    ]),
    text: `From: ${name ? `${name} <${email}>` : email}\nTopic: ${topic}\n\n${message}`,
    tags: [{ name: "kind", value: "support-request" }],
  });

  if (error) {
    const failure = new Error(`Support request email failed: ${error.message}`);
    reportError(failure, {
      category: "email.resend",
      tags: { kind: "support-request", resendErrorName: error.name },
    });
    throw failure;
  }
}

export async function sendAbuseReportEmail({
  username,
  reason,
  details,
  reporterEmail,
  reportId,
}: {
  username: string;
  reason: string;
  details: string | null;
  reporterEmail: string | null;
  reportId: string;
}) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [SUPPORT_EMAIL],
    replyTo: reporterEmail ?? undefined,
    subject: `[Report] ${reason} — tippy.cash/${username}`,
    html: internalRelayHtml([
      ["Page", `tippy.cash/${username}`],
      ["Reason", reason],
      ["Details", details || "—"],
      ["Reporter", reporterEmail || "Not provided"],
      ["Report ID", reportId],
    ]),
    text: `Page: tippy.cash/${username}\nReason: ${reason}\nDetails: ${details || "—"}\nReporter: ${reporterEmail || "Not provided"}\nReport ID: ${reportId}`,
    tags: [{ name: "kind", value: "abuse-report" }],
  });

  if (error) {
    const failure = new Error(`Abuse report email failed: ${error.message}`);
    reportError(failure, {
      category: "email.resend",
      tags: { kind: "abuse-report", resendErrorName: error.name },
    });
    throw failure;
  }
}

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM ?? "Tippy <login@tippy.cash>";

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
                email &mdash; nothing happens without the link.
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
      text: `Sign in to Tippy: ${url}\n\nThis link expires in 5 minutes and can only be used once. If you didn't request it, you can safely ignore this email.`,
    },
    // One key per issued token: retries of the same request can't double-send,
    // while every new link remains a fresh email.
    { idempotencyKey: `magic-link/${token}` },
  );

  if (error) {
    throw new Error(`Magic link email failed: ${error.message}`);
  }
}

import { INBOX_PROVIDERS } from "./data";

function inboxUrl(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return INBOX_PROVIDERS[domain] ?? null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Placeholder until better-auth's magic-link plugin + mailer are configured
async function requestMagicLink(email: string) {
  void email;
  await new Promise((resolve) => window.setTimeout(resolve, 700));
}

export { inboxUrl, isValidEmail, requestMagicLink };

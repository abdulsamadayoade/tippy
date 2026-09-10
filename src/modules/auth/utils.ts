import { authClient } from "@/lib/auth-client";
import { INBOX_PROVIDERS } from "./data";

function inboxUrl(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return INBOX_PROVIDERS[domain] ?? null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function requestMagicLink(email: string, claimUsername?: string | null) {
  const onboardingUrl = claimUsername
    ? `/onboarding?username=${encodeURIComponent(claimUsername)}`
    : "/onboarding";

  const { error } = await authClient.signIn.magicLink({
    email,
    callbackURL: claimUsername ? onboardingUrl : "/overview",
    newUserCallbackURL: onboardingUrl,
    errorCallbackURL: "/login?error=link",
  });

  return error ? "We couldn’t send the link. Try again." : null;
}

async function signInWithGoogle({
  mode,
  claimUsername,
}: {
  mode: "sign-in" | "sign-up";
  claimUsername?: string | null;
}) {
  const onboardingUrl = claimUsername
    ? `/onboarding?username=${encodeURIComponent(claimUsername)}`
    : "/onboarding";
  const authPath = mode === "sign-in" ? "/login" : "/register";
  const errorUrl = claimUsername
    ? `${authPath}?username=${encodeURIComponent(claimUsername)}&auth=google`
    : `${authPath}?auth=google`;

  const { error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: claimUsername ? onboardingUrl : "/overview",
    newUserCallbackURL: onboardingUrl,
    errorCallbackURL: errorUrl,
  });

  return error ? "We couldn’t continue with Google. Try again." : null;
}

export { inboxUrl, isValidEmail, requestMagicLink, signInWithGoogle };

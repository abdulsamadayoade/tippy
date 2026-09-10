"use client";

import { useSignIn } from "../hooks/use-sign-in";
import Link from "next/link";
import { Button, buttonClassName } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { ErrorMessage } from "@/components/elements/error-message";
import { MailIcon } from "@/components/icons/mail";
import { GoogleIcon } from "@/components/icons/google";

export function SignIn({ mode }: { mode: "sign-in" | "sign-up" }) {
  const {
    email,
    error,
    sending,
    sent,
    secondsLeft,
    linkFailed,
    googleFailed,
    googleError,
    connectingToGoogle,
    providerUrl,
    updateEmail,
    sendEmailLink,
    resend,
    continueWithGoogle,
    useDifferentEmail,
  } = useSignIn(mode);
  const linkNoun = mode === "sign-in" ? "sign-in link" : "sign-up link";

  if (sent) {
    return (
      <section className="flex w-full max-w-88 flex-col items-center text-center">
        <span
          className="flex size-14 items-center justify-center rounded-full bg-soft"
          aria-hidden="true">
          <MailIcon className="size-6 text-main-heading" />
        </span>

        <h1 className="mt-7 text-xl font-semibold tracking-tight text-main-heading">
          Check your inbox
        </h1>

        <p className="mt-3 max-w-80 text-muted-text text-pretty">
          We sent a one-tap {linkNoun} to{" "}
          <strong className="font-semibold text-main-heading">
            {email.trim()}
          </strong>
          . Open it on this device to finish{" "}
          {mode === "sign-in" ? "signing in" : "signing up"}.
        </p>

        <a
          className={buttonClassName({ className: "mt-7 min-h-13 w-full" })}
          href={providerUrl ?? "mailto:"}
          target={providerUrl ? "_blank" : undefined}
          rel={providerUrl ? "noreferrer noopener" : undefined}>
          Open email app
        </a>

        <p className="mt-5 text-sm text-muted-text">
          Didn&apos;t get it?{" "}
          {secondsLeft > 0 ? (
            <span className="font-semibold text-main-heading">
              Resend in {secondsLeft}s
            </span>
          ) : (
            <button
              className="cursor-pointer font-semibold text-main-heading"
              type="button"
              onClick={resend}>
              Resend
            </button>
          )}
        </p>

        <button
          className="mt-3 cursor-pointer text-sm font-medium text-muted-text"
          type="button"
          onClick={useDifferentEmail}>
          Use a different email
        </button>
      </section>
    );
  }

  return (
    <section className="w-full max-w-88 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-main-heading">
        {mode === "sign-in" ? "Sign in to Tippy" : "Create your Tippy account"}
      </h1>
      <p className="mx-auto max-w-70 mt-1.5 text-muted-text text-pretty">
        Continue with Google or use a one-tap email link. No password to
        remember.
      </p>

      <div className="mt-8">
        {(googleFailed || googleError) && (
          <ErrorMessage>
            {googleError || "Google sign-in didn’t finish. Please try again."}
          </ErrorMessage>
        )}

        <Button
          className="w-full bg-white shadow-surface hover:bg-soft"
          variant="secondary"
          type="button"
          loading={connectingToGoogle}
          loadingText="Connecting…"
          onClick={continueWithGoogle}>
          <GoogleIcon className="size-4.5" aria-hidden="true" />
          Continue with Google
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="text-ui-sm text-muted-text-2">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        className="text-left"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          await sendEmailLink();
        }}>
        {linkFailed && !sent && (
          <ErrorMessage>
            That sign-in link is invalid or has expired. Request a new one
            below.
          </ErrorMessage>
        )}
        <TextInput
          label="Email"
          labelClassName="text-main-heading"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          required
          placeholder="name@email.com"
          value={email}
          error={error}
          onChange={(event) => updateEmail(event.target.value)}
        />

        <Button
          className="mt-4 w-full"
          type="submit"
          loading={sending}
          loadingText="Sending link…">
          Email me a {linkNoun}
        </Button>
      </form>

      <p className="mt-5 text-ui-sm text-muted-text-2">
        By continuing you agree to Tippy&apos;s{" "}
        <Link
          className="font-medium text-main-heading hover:underline"
          href="/terms">
          Terms
        </Link>{" "}
        and{" "}
        <Link
          className="font-medium text-main-heading hover:underline"
          href="/privacy">
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}

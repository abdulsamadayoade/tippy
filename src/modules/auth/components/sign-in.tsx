"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { useSearchParams } from "next/navigation";
import { inboxUrl, isValidEmail, requestMagicLink } from "../utils";
import Link from "next/link";
import { Button, buttonClassName } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { ErrorMessage } from "@/components/elements/error-message";
import { MailIcon } from "@/components/icons/mail";
import { RESEND_SECONDS } from "../data";

export function SignIn({ mode }: { mode: "sign-in" | "sign-up" }) {
  const searchParams = useSearchParams();
  const claimUsername = searchParams.get("username");
  const linkFailed = searchParams.get("error") === "link";
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const linkNoun = mode === "sign-in" ? "sign-in link" : "sign-up link";

  useEffect(() => {
    if (!sent || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sent, secondsLeft]);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSending(true);
    const failure = await requestMagicLink(email.trim(), claimUsername);
    setSending(false);

    if (failure) {
      setError(failure);
      return;
    }

    setSecondsLeft(RESEND_SECONDS);
    setSent(true);
  }

  async function resend() {
    setSecondsLeft(RESEND_SECONDS);
    const failure = await requestMagicLink(email.trim(), claimUsername);

    if (failure) {
      setSent(false);
      setError(failure);
    }
  }

  function useDifferentEmail() {
    setSent(false);
    setError("");
  }

  if (sent) {
    const providerUrl = inboxUrl(email);

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
        Enter your email and we&apos;ll send a one-tap {linkNoun}. No password
        to remember.
      </p>

      <form className="mt-8 text-left" noValidate onSubmit={submit}>
        {linkFailed && !sent ? (
          <ErrorMessage>
            That sign-in link is invalid or has expired. Request a new one
            below.
          </ErrorMessage>
        ) : null}
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
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
        />

        <Button
          className="mt-4 w-full"
          type="submit"
          loading={sending}
          loadingText="Sending link…">
          Email me a {linkNoun}
        </Button>
      </form>

      <p className="mt-5 text-[13px] text-muted-text-2">
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

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  inboxUrl,
  isValidEmail,
  requestMagicLink,
  signInWithGoogle,
} from "../utils";
import { RESEND_SECONDS } from "../data";

export function useSignIn(mode: "sign-in" | "sign-up") {
  const searchParams = useSearchParams();
  const claimUsername = searchParams.get("username");
  const linkFailed = searchParams.get("error") === "link";
  const googleFailed =
    searchParams.get("auth") === "google" && searchParams.has("error");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [connectingToGoogle, setConnectingToGoogle] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [sent, setSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    function resetGoogleOnReturn(event: PageTransitionEvent) {
      if (event.persisted) setConnectingToGoogle(false);
    }

    window.addEventListener("pageshow", resetGoogleOnReturn);
    return () => window.removeEventListener("pageshow", resetGoogleOnReturn);
  }, []);

  useEffect(() => {
    if (!sent || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sent, secondsLeft]);

  async function sendEmailLink() {
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

  async function continueWithGoogle() {
    setConnectingToGoogle(true);
    setGoogleError("");

    try {
      const failure = await signInWithGoogle({ mode, claimUsername });
      if (failure) setGoogleError(failure);
    } catch {
      setGoogleError("We couldn’t continue with Google. Try again.");
    } finally {
      setConnectingToGoogle(false);
    }
  }

  function useDifferentEmail() {
    setSent(false);
    setError("");
  }

  function updateEmail(value: string) {
    setEmail(value);
    if (error) setError("");
  }

  return {
    email,
    error,
    sending,
    sent,
    secondsLeft,
    linkFailed,
    googleFailed,
    googleError,
    connectingToGoogle,
    providerUrl: inboxUrl(email),
    updateEmail,
    sendEmailLink,
    resend,
    continueWithGoogle,
    useDifferentEmail,
  };
}

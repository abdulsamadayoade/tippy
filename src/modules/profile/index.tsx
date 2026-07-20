"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTips } from "@/store/providers";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/modal";
import type { ProfileProps } from "./types";
import { MAXIMUM_TIP, MINIMUM_TIP } from "@/data/constants";
import { DEFAULT_TIP, PRESETS } from "./data";
import { AnimatedNaira } from "./components/animated-naira";
import { fireConfetti } from "./components/confetti";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";
import { AmountInput } from "@/components/ui/amount-input";
import { AmountPreset } from "@/components/ui/amount-preset";
import { Switch } from "@/components/ui/switch";
import { formatNaira } from "@/lib/utils";
import { Header } from "./components/header";
import { Secured } from "@/components/elements/secured";
import { Nav } from "@/components/layout/nav";
import { CheckoutPanel } from "./components/checkout-panel";
import { Success } from "./components/success";
import type { CheckoutResponse, Step } from "./types";

export function Profile({ creator, viewerSignedIn, monnify }: ProfileProps) {
  const { addTip } = useTips();
  const [amount, setAmount] = useState(DEFAULT_TIP);
  const [message, setMessage] = useState("");
  const [tipperName, setTipperName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const checkoutCloseRef = useRef<HTMLButtonElement>(null);
  const payingRef = useRef(false);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const checkRef = useRef<HTMLSpanElement>(null);
  const [checkState, setCheckState] = useState<"out" | "in">("out");
  const amountIsValid = amount >= MINIMUM_TIP && amount <= MAXIMUM_TIP;

  function openCheckout() {
    if (!amountIsValid) return;
    setCheckoutOpen(true);
  }

  function closeCheckout() {
    if (!payingRef.current) setCheckoutOpen(false);
  }

  useEffect(() => {
    if (step !== "success") return;
    return fireConfetti(confettiRef.current);
  }, [step]);

  useEffect(() => {
    if (step !== "success") return;

    const frame = window.requestAnimationFrame(() => {
      if (checkRef.current) void checkRef.current.offsetWidth;
      setCheckState("in");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  function releasePaying() {
    payingRef.current = false;
    setPaying(false);
  }

  function celebrateTip(paymentReference: string) {
    const trimmedName = tipperName.trim();
    const displayTipper = anonymous ? "Anonymous" : trimmedName || "You";

    addTip({
      id: paymentReference,
      name: displayTipper,
      amount,
      note: message.trim(),
      anonymous,
      initial: anonymous ? "?" : displayTipper.charAt(0).toUpperCase(),
      shade: "strong",
      time: "just now",
      createdAt: new Date().toISOString(),
      reference: paymentReference,
    });
    releasePaying();
    setCheckoutOpen(false);
    setStep("success");
  }

  function failTip() {
    releasePaying();
    setPaymentError(
      "Your payment didn’t complete, so no tip was sent. You can try again.",
    );
  }

  /**
   * The Monnify webhook settles the transaction; this only watches our own
   * database for that settlement — Monnify's status API is never called
   * from here.
   */
  async function confirmTip(paymentReference: string) {
    for (let attempt = 0; attempt < 12; attempt++) {
      let status = "pending";

      try {
        const response = await fetch(`/api/tips/${paymentReference}`);
        const result = (await response.json()) as { status?: string };
        status = result.status ?? "pending";
      } catch {
        // Transient network failure — keep watching.
      }

      if (status === "success") {
        celebrateTip(paymentReference);
        return;
      }

      if (status === "failed") {
        failTip();
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }

    releasePaying();
    setPaymentError(
      "We couldn’t confirm your payment yet. If you were debited, your tip will come through shortly.",
    );
  }

  async function submitTip() {
    if (paying) return;

    if (!monnify) {
      setPaymentError("Payments aren’t available right now. Try again later.");
      return;
    }

    if (!window.MonnifySDK) {
      setPaymentError(
        "We couldn’t load the secure payment window. Check your connection and try again.",
      );
      return;
    }

    payingRef.current = true;
    setPaying(true);
    setPaymentError("");

    let checkout: CheckoutResponse;

    try {
      const response = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: creator.username,
          amount,
          note: message,
          anonymous,
          tipperName: anonymous ? "" : tipperName,
        }),
      });

      const result = (await response.json()) as
        | CheckoutResponse
        | { message?: string };

      if (!response.ok || !("paymentReference" in result)) {
        throw new Error("message" in result ? result.message : undefined);
      }

      checkout = result;
    } catch (error) {
      setPaymentError(
        error instanceof Error && error.message
          ? error.message
          : "We couldn’t start your payment. Check your connection and try again.",
      );
      releasePaying();
      return;
    }

    // Guards the race between onComplete and the onClose that follows it.
    const settled = { current: false };

    window.MonnifySDK.initialize({
      amount: checkout.amount,
      currency: "NGN",
      reference: checkout.paymentReference,
      customerFullName: checkout.customerFullName,
      customerEmail: checkout.customerEmail,
      apiKey: monnify.apiKey,
      contractCode: monnify.contractCode,
      paymentDescription: `Tip for ${creator.displayName}`,
      onComplete: () => {
        if (settled.current) return;
        settled.current = true;
        void confirmTip(checkout.paymentReference);
      },
      onClose: () => {
        if (settled.current) return;
        settled.current = true;
        releasePaying();
      },
    });
  }

  function reset() {
    setAmount(DEFAULT_TIP);
    setMessage("");
    setTipperName("");
    setAnonymous(false);
    setPaymentError("");
    setCheckState("out");
    setStep("form");
  }

  return (
    <>
      <Script
        src="https://sdk.monnify.com/plugin/monnify.js"
        strategy="afterInteractive"
      />
      <div className="min-h-screen flex flex-col justify-between">
        <Nav>
          <div className="flex items-center gap-2">
            <ButtonLink
              variant="secondary"
              size="xs"
              href={viewerSignedIn ? "/overview" : "/login"}>
              {viewerSignedIn ? "Dashboard" : "Login"}
            </ButtonLink>

            {viewerSignedIn ? null : (
              <ButtonLink variant="secondary" size="xs" href="/register">
                Claim my Link
              </ButtonLink>
            )}
          </div>
        </Nav>

        <main className="md:min-h-screen overflow-x-hidden pt-10 flex-1 flex flex-col justify-between">
          <Header creator={creator} />

          <section
            className={cn(
              "bg-white shadow-surface mx-auto w-full max-w-130",
              "mt-8 rounded-t-[18px] p-5 shadow-surface-raised",
            )}>
            <div>
              <h2 className="text-base font-medium">
                Support {creator.displayName}&apos;s next stream
              </h2>
              <p className="text-ui-sm text-muted-text">
                Choose an amount and add a note if you&apos;d like.
              </p>
            </div>

            <div
              className="mt-4 grid grid-cols-2 gap-2"
              aria-label="Tip amount presets">
              {PRESETS.map((preset) => (
                <AmountPreset
                  key={preset.amount}
                  amount={preset.amount}
                  label={preset.label}
                  popular={preset.popular}
                  selected={amount === preset.amount}
                  onSelect={() => setAmount(preset.amount)}
                />
              ))}
            </div>

            <AmountInput
              containerClassName="mt-4"
              label="Other amount"
              name="amount"
              value={amount}
              onValueChange={setAmount}
              max={MAXIMUM_TIP}
              error={
                amountIsValid
                  ? undefined
                  : `Enter at least ${formatNaira(MINIMUM_TIP)}.`
              }
              hint={`Enter any amount up to ${formatNaira(MAXIMUM_TIP)}.`}
            />

            <TextArea
              containerClassName="mt-2.5"
              label={`Add a note for ${creator.displayName}`}
              visuallyHideLabel
              showCount
              id="tip-message"
              name="message"
              rows={2}
              maxLength={140}
              autoComplete="off"
              value={message}
              placeholder={`Write ${creator.displayName} a note (optional)…`}
              onChange={(event) => setMessage(event.target.value)}
            />

            {anonymous ? null : (
              <TextInput
                containerClassName="mt-2.5"
                label="Your name"
                visuallyHideLabel
                id="tipper-name"
                name="tipperName"
                type="text"
                autoComplete="name"
                maxLength={50}
                placeholder="Your name (optional)"
                value={tipperName}
                onChange={(event) => setTipperName(event.target.value)}
              />
            )}

            <Switch
              className="mt-3.5"
              checked={anonymous}
              onCheckedChange={setAnonymous}
              label="Tip privately"
              description={`${creator.displayName} will see “Anonymous” instead of your name`}
            />

            <Button
              className="w-full mt-4"
              disabled={!amountIsValid}
              onClick={openCheckout}>
              {amountIsValid ? (
                <span className="inline-flex items-baseline gap-1">
                  <span>Send</span>
                  <AnimatedNaira value={amount} />
                  <span>to {creator.displayName}</span>
                </span>
              ) : (
                "Enter an amount"
              )}
            </Button>
            <Secured />
          </section>

          {step === "success" && (
            <Success
              creatorName={creator.displayName}
              confettiRef={confettiRef}
              checkRef={checkRef}
              checkState={checkState}
              amount={amount}
              message={message}
              reset={reset}
            />
          )}
        </main>
      </div>

      <Modal
        open={checkoutOpen}
        onClose={closeCheckout}
        variant="panel"
        dismissible={!paying}
        restoreFocus={step === "form"}
        labelledBy="checkout-title"
        initialFocusRef={checkoutCloseRef}
        overlayClassName="z-40"
        className="max-h-[calc(100dvh-24px)] w-full max-w-130 overflow-y-auto overscroll-contain rounded-t-3xl bg-white px-5 pt-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-[0_-16px_50px_-20px_rgba(0,0,0,0.3)]">
        <CheckoutPanel
          creatorName={creator.displayName}
          creatorPhotoUrl={creator.avatarUrl}
          amount={amount}
          message={message}
          paying={paying}
          error={paymentError}
          onSubmit={submitTip}
          onClose={closeCheckout}
          closeRef={checkoutCloseRef}
        />
      </Modal>
    </>
  );
}

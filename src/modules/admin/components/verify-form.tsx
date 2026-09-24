"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { ErrorMessage } from "@/components/elements/error-message";
import {
  startTotpEnrollment,
  verifyAdminTotp,
  verifyAdminBackupCode,
} from "../actions/auth";
import type { AdminVerifyFormProps, Enrollment } from "../types";

export function AdminVerifyForm({ mode }: AdminVerifyFormProps) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [starting, setStarting] = useState(false);
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function beginEnrollment() {
    setStarting(true);
    setError("");
    const result = await startTotpEnrollment();
    setStarting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setEnrollment(result);
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) {
      setError("Enter a code.");
      return;
    }

    setVerifying(true);
    setError("");
    const result = useBackupCode
      ? await verifyAdminBackupCode(code)
      : await verifyAdminTotp(code);
    setVerifying(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Hard navigation on purpose: the client router may have cached the
    // earlier /admin -> /admin/verify redirect, which would bounce a soft
    // navigation straight back here.
    window.location.replace("/admin");
  }

  if (mode === "enroll" && !enrollment) {
    return (
      <section className="mx-auto w-full max-w-88 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-main-heading">
          Set up two-factor authentication
        </h1>
        <p className="mt-1.5 text-muted-text text-pretty">
          Operator access requires an authenticator app. You&apos;ll scan a QR
          code and confirm a 6-digit code.
        </p>
        {error && (
          <div className="mt-4">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}
        <Button
          className="mt-6 w-full"
          loading={starting}
          loadingText="Preparing…"
          onClick={beginEnrollment}>
          Start setup
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-88">
      {enrollment ? (
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-main-heading">
            Scan this QR code
          </h1>
          <p className="mt-1.5 text-muted-text text-pretty">
            Add Tippy Ops to your authenticator app, then enter the 6-digit code
            below.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mx-auto mt-5 size-44 rounded-xl bg-white p-2"
            src={enrollment.qrDataUrl}
            alt="TOTP enrollment QR code"
          />
          <p className="mt-3 text-xs break-all text-muted-text">
            Can&apos;t scan? Enter this key manually:{" "}
            <code className="font-mono text-main-heading">
              {enrollment.secret}
            </code>
          </p>
          <div className="mt-5 rounded-md bg-soft p-4 text-left">
            <p className="text-sm font-semibold text-main-heading">
              Backup codes — save these now
            </p>
            <p className="mt-1 text-xs text-muted-text">
              Each works once if you lose your authenticator. They won&apos;t be
              shown again.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-1 font-mono text-sm text-body-text">
              {enrollment.backupCodes.map((backupCode) => (
                <li key={backupCode}>{backupCode}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-main-heading">
            Verify it&apos;s you
          </h1>
          <p className="mt-1.5 text-muted-text text-pretty">
            {useBackupCode
              ? "Enter one of your backup codes."
              : "Enter the 6-digit code from your authenticator app."}
          </p>
        </div>
      )}

      <form noValidate onSubmit={submit}>
        <TextInput
          label={useBackupCode ? "Backup code" : "Authenticator code"}
          labelClassName="text-main-heading"
          name="code"
          inputMode={useBackupCode ? "text" : "numeric"}
          autoComplete="one-time-code"
          spellCheck={false}
          required
          placeholder={useBackupCode ? "backup code" : "123456"}
          value={code}
          error={error}
          onChange={(event) => {
            setCode(event.target.value);
            if (error) setError("");
          }}
        />

        <Button
          className="mt-4 w-full"
          type="submit"
          loading={verifying}
          loadingText="Verifying…">
          {enrollment ? "Confirm and finish setup" : "Verify"}
        </Button>
      </form>

      {!enrollment && (
        <button
          className="mx-auto mt-5 block cursor-pointer text-sm font-medium text-muted-text hover:text-main-heading"
          type="button"
          onClick={() => {
            setUseBackupCode((current) => !current);
            setCode("");
            setError("");
          }}>
          {useBackupCode
            ? "Use authenticator code instead"
            : "Use a backup code instead"}
        </button>
      )}
    </section>
  );
}

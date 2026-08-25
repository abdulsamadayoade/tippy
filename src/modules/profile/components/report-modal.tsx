"use client";

import { useId, useState, type SubmitEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";
import { ErrorMessage } from "@/components/elements/error-message";
import { isValidEmail } from "@/modules/auth/utils";
import { REASONS } from "../data";

export function ReportPage({ username }: { username: string }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState("");

  const reasonError = reason ? "" : "Pick a reason from the list.";
  const emailError =
    reporterEmail.trim() === "" || isValidEmail(reporterEmail)
      ? ""
      : "Enter a valid email, or leave this blank.";

  function openModal() {
    setReason("");
    setDetails("");
    setReporterEmail("");
    setSubmitAttempted(false);
    setServerError("");
    setStatus("idle");
    setOpen(true);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setServerError("");
    if (reasonError || emailError || status === "sending") return;

    setStatus("sending");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          reason,
          details: details.trim(),
          reporterEmail: reporterEmail.trim(),
          website,
        }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        throw new Error(result.message);
      }

      setStatus("sent");
    } catch (error) {
      setStatus("idle");
      setServerError(
        error instanceof Error && error.message
          ? error.message
          : "We couldn’t send your report. Check your connection and try again.",
      );
    }
  }

  return (
    <>
      <button
        className="mx-auto mt-3 block cursor-pointer text-xs text-muted-text-2 transition-colors duration-100 hover:text-muted-text hover:underline"
        type="button"
        onClick={openModal}>
        Report this page
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        dismissible={status !== "sending"}
        labelledBy={`${uid}-title`}
        className="w-full max-w-105 rounded-[20px] bg-white p-5.5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)]">
        {status === "sent" ? (
          <>
            <h2
              className="text-xl font-medium tracking-display text-main-heading"
              id={`${uid}-title`}>
              Report sent
            </h2>
            <p className="mt-1.5 text-sm leading-normal text-body-text">
              Thanks — we&rsquo;ve got it. We review every report.
            </p>
            <Button
              className="mt-5 w-full"
              variant="secondary"
              onClick={() => setOpen(false)}>
              Close
            </Button>
          </>
        ) : (
          <>
            <h2
              className="text-xl font-medium tracking-display text-main-heading"
              id={`${uid}-title`}>
              Report this page
            </h2>
            <p className="mt-1.5 text-sm leading-normal text-body-text">
              Tell us what&rsquo;s wrong with @{username}&rsquo;s page. We
              review every report.
            </p>

            <form
              className="mt-5 flex flex-col gap-3.5"
              onSubmit={handleSubmit}
              noValidate>
              <Select
                label="Reason"
                placeholder="Pick a reason"
                value={reason}
                error={submitAttempted ? reasonError || undefined : undefined}
                onChange={(event) => setReason(event.target.value)}>
                {REASONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <TextArea
                className="min-h-20"
                label="What happened? (optional)"
                showCount
                rows={3}
                maxLength={500}
                autoComplete="off"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
              />

              <TextInput
                label="Your email (optional)"
                controlClassName="min-h-12"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                maxLength={254}
                hint="Only if you’d like us to follow up."
                value={reporterEmail}
                error={submitAttempted ? emailError || undefined : undefined}
                onChange={(event) => setReporterEmail(event.target.value)}
              />

              <div aria-hidden="true" className="hidden">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              {serverError ? <ErrorMessage>{serverError}</ErrorMessage> : null}

              <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                <Button
                  variant="secondary"
                  className="min-h-11"
                  disabled={status === "sending"}
                  onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="min-h-11"
                  type="submit"
                  loading={status === "sending"}
                  loadingText="Sending…">
                  Send report
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}

"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { Select } from "@/components/ui/select";
import { ErrorMessage } from "@/components/elements/error-message";
import { isValidEmail } from "@/modules/auth/utils";
import { TOPICS } from "../data";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState("");

  const emailError = isValidEmail(email) ? "" : "Enter your email address.";
  const topicError = topic ? "" : "Pick a topic from the list.";
  const messageError = message.trim() ? "" : "Tell us what’s going on.";
  const hasErrors = Boolean(emailError || topicError || messageError);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setServerError("");
    if (hasErrors || status === "sending") return;

    setStatus("sending");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          message: message.trim(),
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
          : "We couldn’t send your message. Check your connection and try again.",
      );
    }
  }

  if (status === "sent") {
    return (
      <p className="mt-3 rounded-md bg-success-soft px-4 py-2 text-sm leading-normal text-success">
        Message sent. We&rsquo;ll reply to {email.trim()} within 12 hours.
      </p>
    );
  }

  return (
    <form
      className="mt-3 flex flex-col gap-3.5"
      onSubmit={handleSubmit}
      noValidate>
      <div className="grid grid-cols-2 gap-2.5 max-phone:grid-cols-1">
        <TextInput
          label="Your name"
          visuallyHideLabel
          controlClassName="min-h-12"
          type="text"
          autoComplete="name"
          maxLength={100}
          placeholder="Your name (optional)"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextInput
          label="Your email"
          visuallyHideLabel
          controlClassName="min-h-12"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          maxLength={254}
          placeholder="Your email"
          value={email}
          error={submitAttempted ? emailError || undefined : undefined}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <Select
        label="Topic"
        visuallyHideLabel
        placeholder="What’s this about?"
        value={topic}
        error={submitAttempted ? topicError || undefined : undefined}
        onChange={(event) => setTopic(event.target.value)}>
        {TOPICS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <TextArea
        className="min-h-28"
        label="Message"
        visuallyHideLabel
        showCount
        rows={4}
        maxLength={1000}
        autoComplete="off"
        placeholder="Tell us what’s going on — include a receipt or payout reference if you have one…"
        value={message}
        error={submitAttempted ? messageError || undefined : undefined}
        onChange={(event) => setMessage(event.target.value)}
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

      <Button
        className="self-start"
        type="submit"
        size="sm"
        loading={status === "sending"}
        loadingText="Sending…">
        Send message
      </Button>
    </form>
  );
}

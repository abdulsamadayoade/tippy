import type { SubmitEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { StepHeader } from "./step-header";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "../data";
import type { ClaimLinkStepProps } from "../types";

export function ClaimLinkStep({
  username,
  onUsernameChange,
  onContinue,
}: ClaimLinkStepProps) {
  const trimmedUsername = username.trim();
  const usernameHasInvalidChars =
    trimmedUsername.length > 0 && !USERNAME_PATTERN.test(trimmedUsername);
  const usernameIsValid =
    trimmedUsername.length >= USERNAME_MIN_LENGTH && !usernameHasInvalidChars;

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (usernameIsValid) onContinue();
  }

  return (
    <section className="w-full max-w-88 animate-rise-in">
      <StepHeader
        step={1}
        title="Claim your link"
        sub="This is where your supporters will send tips. You can change it later."
      />

      <form className="mt-8" noValidate onSubmit={submit}>
        <TextInput
          label="Your Tippy link"
          labelClassName="text-main-heading"
          leadingContent={<span aria-hidden="true">tippy.cash/</span>}
          name="username"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          minLength={USERNAME_MIN_LENGTH}
          maxLength={USERNAME_MAX_LENGTH}
          placeholder="yourname"
          value={username}
          hint="Letters, numbers, and underscores only."
          error={
            usernameHasInvalidChars
              ? "Only letters, numbers, and underscores."
              : undefined
          }
          onChange={(event) => onUsernameChange(event.target.value)}
        />

        <Button
          className="mt-5 w-full"
          type="submit"
          disabled={!usernameIsValid}>
          Continue
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-text">
        Already have a page?{" "}
        <Link className="font-semibold text-main-heading" href="/overview">
          Go to dashboard
        </Link>
      </p>
    </section>
  );
}

"use client";

import { useRef, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { Select } from "@/components/ui/select";
import { ArrowLeftIcon } from "@/components/icons/arrow-left";
import { StepHeader } from "./step-header";
import { BIO_MAX_LENGTH, CATEGORIES } from "../data";
import type { ProfileStepProps } from "../types";

export function ProfileStep({
  displayName,
  onDisplayNameChange,
  category,
  onCategoryChange,
  bio,
  onBioChange,
  photoUrl,
  onPhotoChange,
  finishing,
  onBack,
  onFinish,
}: ProfileStepProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const canFinish = displayName.trim().length > 0 && category !== "";

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canFinish) onFinish();
  }

  return (
    <section className="w-full max-w-88 animate-rise-in">
      <StepHeader
        step={2}
        title="Set up your profile"
        sub="A photo and a short bio help supporters recognise you."
      />

      <form className="mt-8" noValidate onSubmit={submit}>
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-main-heading text-xl font-medium text-white">
            {photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element -- blob: preview URLs aren't supported by next/image */
              <img
                className="size-full object-cover"
                src={photoUrl}
                alt="Your profile photo"
              />
            ) : (
              <span aria-hidden="true">?</span>
            )}
          </span>
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="secondary"
              size="xs"
              className="h-8"
              onClick={() => photoInputRef.current?.click()}>
              {photoUrl ? "Change photo" : "Add photo"}
            </Button>
            <span className="text-[13px] text-muted-text">
              Optional · a square image works best
            </span>
          </div>
          <input
            ref={photoInputRef}
            className="sr-only"
            type="file"
            accept="image/*"
            aria-label="Add a profile photo"
            onChange={(event) => onPhotoChange(event.target.files?.[0])}
          />
        </div>

        <div className="space-y-5 mt-6">
          <TextInput
            label="Display name"
            labelClassName="text-main-heading"
            name="displayName"
            type="text"
            autoComplete="name"
            maxLength={50}
            placeholder="Ada Obi"
            value={displayName}
            onChange={(event) => onDisplayNameChange(event.target.value)}
          />

          <Select
            label="What do you create?"
            labelClassName="text-main-heading"
            name="category"
            placeholder="Select a category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>

          <TextArea
            className="min-h-24"
            label="Short bio"
            labelClassName="text-main-heading"
            labelTrailing={
              <span className="text-xs font-medium text-muted-text-2 tabular-nums">
                {bio.length}/{BIO_MAX_LENGTH}
              </span>
            }
            name="bio"
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            autoComplete="off"
            placeholder="Tell supporters what you create and what their tips help with."
            value={bio}
            onChange={(event) => onBioChange(event.target.value)}
          />
        </div>

        <div className="mt-7 flex gap-3">
          <Button variant="secondary" className="px-5" onClick={onBack}>
            <ArrowLeftIcon className="size-4.5" aria-hidden="true" />
            Back
          </Button>
          <Button
            className="flex-1"
            type="submit"
            disabled={!canFinish}
            loading={finishing}
            loadingText="Finishing up…">
            Finish setup
          </Button>
        </div>
      </form>
    </section>
  );
}

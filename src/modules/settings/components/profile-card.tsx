"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { Select } from "@/components/ui/select";
import { CreatorAvatar } from "@/components/ui/creator-avatar";
import { CameraIcon } from "@/components/icons/camera";
import { compressAvatar } from "@/modules/onboarding/utils";
import { BIO_MAX_LENGTH } from "@/modules/onboarding/data";
import { changeAvatar, updateProfile } from "../actions";
import { validate } from "../utils";
import type {
  ProfileCardProps,
  ProfileFormErrors,
  ProfileValues,
} from "../types";

export function ProfileCard({ creator, categories }: ProfileCardProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ProfileValues>({
    displayName: creator.displayName,
    categoryId: creator.categoryId,
    bio: creator.bio ?? "",
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<ProfileFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const clientErrors = validate(values);
  const errors: ProfileFormErrors = submitAttempted
    ? { ...clientErrors, ...serverErrors }
    : {};

  function setValue(patch: Partial<ProfileValues>) {
    setSaved(false);
    setValues((current) => ({ ...current, ...patch }));
  }

  async function pickPhoto(file: File | undefined) {
    if (!file || photoSaving) return;
    setPhotoSaving(true);
    setPhotoError(null);

    const compressed = await compressAvatar(file);
    const formData = new FormData();
    formData.set("photo", compressed);

    const result = await changeAvatar(formData);
    setPhotoSaving(false);
    if (result.error) setPhotoError(result.error);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setServerErrors({});
    if (Object.keys(clientErrors).length > 0 || saving) return;

    setSaving(true);
    const result = await updateProfile({
      displayName: values.displayName.trim(),
      categoryId: values.categoryId,
      bio: values.bio.trim(),
    });
    setSaving(false);

    if (result.errors) {
      setServerErrors(result.errors);
      return;
    }

    setSaved(true);
  }

  return (
    <article className="mt-5 rounded-surface bg-white p-4.5 shadow-surface">
      <div className="flex items-center gap-4">
        <CreatorAvatar
          size="large"
          name={values.displayName || creator.displayName}
          photoUrl={creator.avatarUrl}
        />
        <div className="flex min-w-0 flex-col items-start gap-2">
          <Button
            variant="secondary"
            size="xs"
            className="h-8"
            disabled={photoSaving}
            onClick={() => photoInputRef.current?.click()}>
            <CameraIcon className="size-4" />
            {photoSaving ? "Uploading…" : "Change photo"}
          </Button>
          <span className="text-ui-sm text-muted-text">
            JPEG, PNG, or WebP · a square image works best
          </span>
          {photoError ? (
            <p className="text-xs text-danger" role="alert">
              {photoError}
            </p>
          ) : null}
        </div>
        <input
          ref={photoInputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Change your profile photo"
          onChange={(event) => {
            void pickPhoto(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      <form
        className="mt-5 flex flex-col gap-3.5"
        onSubmit={handleSubmit}
        noValidate>
        <TextInput
          label="Display name"
          controlClassName="min-h-12"
          type="text"
          autoComplete="name"
          maxLength={50}
          placeholder="Ada Obi"
          value={values.displayName}
          error={errors.displayName}
          hint={`Your link stays tippy.cash/${creator.username}`}
          onChange={(event) => setValue({ displayName: event.target.value })}
        />

        <Select
          label="What do you create?"
          placeholder="Select a category"
          value={values.categoryId}
          error={errors.categoryId}
          onChange={(event) => setValue({ categoryId: event.target.value })}>
          {categories.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>

        <TextArea
          className="min-h-24"
          label="Short bio"
          labelTrailing={
            <span className="text-xs font-medium text-muted-text-2 tabular-nums">
              {values.bio.length}/{BIO_MAX_LENGTH}
            </span>
          }
          rows={3}
          maxLength={BIO_MAX_LENGTH}
          autoComplete="off"
          placeholder="Tell supporters what you create and what their tips help with."
          value={values.bio}
          error={errors.bio}
          onChange={(event) => setValue({ bio: event.target.value })}
        />

        {errors.form && (
          <p className="text-xs text-danger" role="alert">
            {errors.form}
          </p>
        )}

        <div className="mt-1 flex items-center gap-3">
          <Button
            type="submit"
            size="sm"
            loading={saving}
            loadingText="Saving…">
            Save changes
          </Button>
          {saved && (
            <span aria-live="polite" className="text-ui-sm text-success">
              Saved
            </span>
          )}
        </div>
      </form>
    </article>
  );
}

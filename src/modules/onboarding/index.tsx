"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClaimLinkStep } from "./components/claim-link-step";
import { ProfileStep } from "./components/profile-step";
import { checkUsernameAvailability, completeOnboarding } from "./actions";
import { compressAvatar } from "./utils";
import type { CategoryOption } from "./types";

export function Onboarding({ categories }: { categories: CategoryOption[] }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState(
    () => searchParams.get("username") ?? "",
  );
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  function updateUsername(next: string) {
    setUsername(next);
    if (usernameError) setUsernameError(null);
  }

  function choosePhoto(file: File | undefined) {
    if (!file) return;
    void (async () => {
      const compressed = await compressAvatar(file);
      setPhotoFile(compressed);
      setPhotoUrl(URL.createObjectURL(compressed));
    })();
  }

  async function continueToProfile() {
    setChecking(true);
    const result = await checkUsernameAvailability(username.trim());
    setChecking(false);

    if (!result.available) {
      setUsernameError(result.message);
      return;
    }

    setStep(2);
  }

  async function finish() {
    setFinishing(true);
    setFormError(null);

    const formData = new FormData();
    formData.set("username", username.trim());
    formData.set("displayName", displayName.trim());
    formData.set("categoryId", categoryId);
    formData.set("bio", bio.trim());
    if (photoFile) formData.set("photo", photoFile);

    // On success the action redirects to /overview and never resolves here.
    const result = await completeOnboarding(formData);
    setFinishing(false);

    if (result?.error) {
      if (result.error.field === "username") {
        setUsernameError(result.error.message);
        setStep(1);
        return;
      }
      setFormError(result.error.message);
    }
  }

  if (step === 2) {
    return (
      <ProfileStep
        categories={categories}
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        bio={bio}
        onBioChange={setBio}
        photoUrl={photoUrl}
        onPhotoChange={choosePhoto}
        finishing={finishing}
        formError={formError}
        onBack={() => setStep(1)}
        onFinish={finish}
      />
    );
  }

  return (
    <ClaimLinkStep
      username={username}
      onUsernameChange={updateUsername}
      serverError={usernameError}
      checking={checking}
      onContinue={continueToProfile}
    />
  );
}

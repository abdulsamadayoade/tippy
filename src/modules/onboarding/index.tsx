"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClaimLinkStep } from "./components/claim-link-step";
import { ProfileStep } from "./components/profile-step";

export function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState(
    () => searchParams.get("username") ?? "",
  );
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  function choosePhoto(file: File | undefined) {
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
  }

  function finish() {
    setFinishing(true);
    router.push(`/${username.trim()}`);
  }

  if (step === 2) {
    return (
      <ProfileStep
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        category={category}
        onCategoryChange={setCategory}
        bio={bio}
        onBioChange={setBio}
        photoUrl={photoUrl}
        onPhotoChange={choosePhoto}
        finishing={finishing}
        onBack={() => setStep(1)}
        onFinish={finish}
      />
    );
  }

  return (
    <ClaimLinkStep
      username={username}
      onUsernameChange={setUsername}
      onContinue={() => setStep(2)}
    />
  );
}

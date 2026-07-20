import { Suspense } from "react";
import { Onboarding } from "@/modules/onboarding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your page",
  description: "Claim your Tippy link and set up your creator profile.",
};

export default function OnboardingPage() {
  return (
    <Suspense>
      <Onboarding />
    </Suspense>
  );
}

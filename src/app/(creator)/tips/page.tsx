import { Suspense } from "react";
import { Tips } from "@/modules/tips";
import { TipsSkeleton } from "@/modules/tips/skeleton";
import { sampleCreator } from "@/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tips received",
  description: `Review every tip, supporter, and note ${sampleCreator.name} has received.`,
};

export default function TipsPage() {
  return (
    <Suspense fallback={<TipsSkeleton />}>
      <Tips />
    </Suspense>
  );
}

import { Suspense } from "react";
import { Tips } from "@/modules/tips";
import { sampleCreator } from "@/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tips received",
  description: `Review every tip, supporter, and note ${sampleCreator.name} has received.`,
};

export default function TipsPage() {
  return (
    <Suspense
      fallback={
        <p className="py-10 text-sm text-muted-text" role="status">
          Loading tips…
        </p>
      }>
      <Tips />
    </Suspense>
  );
}

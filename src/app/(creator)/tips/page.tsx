import { Suspense } from "react";
import { Tips } from "@/modules/tips";
import { TipsSkeleton } from "@/modules/tips/components/skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tips received",
  description: "Review every tip, supporter, and note you’ve received.",
};

export default function TipsPage() {
  return (
    <Suspense fallback={<TipsSkeleton />}>
      <Tips />
    </Suspense>
  );
}

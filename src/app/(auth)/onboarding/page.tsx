import { Suspense } from "react";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { getSessionCreator } from "@/lib/session";
import { Onboarding } from "@/modules/onboarding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your page",
  description: "Claim your Tippy link and set up your creator profile.",
};

export default async function OnboardingPage() {
  const { session, creator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (creator) redirect("/overview");

  const rows = await db
    .select({ id: category.id, name: category.name })
    .from(category)
    .orderBy(asc(category.name));
  const categories = [
    ...rows.filter(({ name }) => name !== "Other"),
    ...rows.filter(({ name }) => name === "Other"),
  ];

  return (
    <Suspense>
      <Onboarding categories={categories} />
    </Suspense>
  );
}

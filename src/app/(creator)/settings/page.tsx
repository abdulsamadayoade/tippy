import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { getSessionCreator } from "@/lib/session";
import { Settings } from "@/modules/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Edit your profile and customise your tip page.",
};

export default async function SettingsPage() {
  const { session, creator: sessionCreator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (!sessionCreator) redirect("/onboarding");

  const rows = await db
    .select({ id: category.id, name: category.name })
    .from(category)
    .orderBy(asc(category.name));
  const categories = [
    ...rows.filter(({ name }) => name !== "Other"),
    ...rows.filter(({ name }) => name === "Other"),
  ];
  const categoryName =
    categories.find(({ id }) => id === sessionCreator.categoryId)?.name ??
    "Other";

  return (
    <Settings
      creator={{
        username: sessionCreator.username,
        displayName: sessionCreator.displayName,
        bio: sessionCreator.bio,
        avatarUrl: sessionCreator.avatarUrl,
        categoryId: sessionCreator.categoryId,
        categoryName,
        tipPresets: sessionCreator.tipPresets,
        allowCustomAmount: sessionCreator.allowCustomAmount,
      }}
      categories={categories}
    />
  );
}

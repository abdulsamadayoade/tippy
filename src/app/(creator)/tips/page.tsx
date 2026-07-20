import { redirect } from "next/navigation";
import { Tips } from "@/modules/tips";
import { getCreatorTips } from "@/lib/dashboard";
import { getSessionCreator } from "@/lib/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tips received",
  description: "Review every tip, supporter, and note you’ve received.",
};

export default async function TipsPage() {
  const { session, creator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (!creator) redirect("/onboarding");

  const tips = await getCreatorTips(creator.id);

  return <Tips tips={tips} />;
}

import { redirect } from "next/navigation";
import { Tips } from "@/modules/tips";
import { isTipFilter } from "@/modules/tips/utils";
import { getTipStats, getTipsPage } from "@/lib/dashboard";
import { getSessionCreator } from "@/lib/session";
import type { TipFilter } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tips received",
  description: "Review every tip, supporter, and note you’ve received.",
};

export default async function TipsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const { session, creator } = await getSessionCreator();

  if (!session) redirect("/login");
  if (!creator) redirect("/onboarding");

  const { filter: requestedFilter } = await searchParams;
  const requested =
    (Array.isArray(requestedFilter) ? requestedFilter[0] : requestedFilter) ??
    null;
  const filter: TipFilter = isTipFilter(requested) ? requested : "all";

  const [stats, firstPage] = await Promise.all([
    getTipStats(creator.id),
    getTipsPage(creator.id, { filter }),
  ]);

  return (
    <Tips
      initialFilter={filter}
      initialTips={firstPage.tips}
      initialCursor={firstPage.nextCursor}
      summary={stats.summary}
    />
  );
}

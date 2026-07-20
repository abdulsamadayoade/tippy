"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Tip } from "@/store/types";
import type { TipFilter } from "../types";
import { isTipFilter } from "../utils";

export function useTipFilter(tips: Tip[]) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedFilter = searchParams.get("filter");
  const filter: TipFilter = isTipFilter(requestedFilter)
    ? requestedFilter
    : "all";

  const filteredTips = useMemo(
    () =>
      tips.filter((tip) => {
        if (filter === "notes") return Boolean(tip.note);
        if (filter === "anonymous") return tip.anonymous;
        return true;
      }),
    [filter, tips],
  );

  function setFilter(nextFilter: TipFilter) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFilter === "all") params.delete("filter");
    else params.set("filter", nextFilter);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return { filter, setFilter, filteredTips };
}

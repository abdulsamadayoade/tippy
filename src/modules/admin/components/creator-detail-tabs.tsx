"use client";

import { useState } from "react";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import type { CreatorDetailTab, CreatorDetailView } from "../types";

export function CreatorDetailTabs({
  tabs,
}: {
  tabs: readonly CreatorDetailTab[];
}) {
  const [activeView, setActiveView] = useState<CreatorDetailView>("tips");
  const activeTab = tabs.find(({ value }) => value === activeView) ?? tabs[0];

  if (!activeTab) return null;

  return (
    <section className="mt-8" aria-labelledby="creator-records-heading">
      <h2 className="sr-only" id="creator-records-heading">
        Creator records
      </h2>
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <SlidingTabs
          idPrefix="creator-records"
          className="text-ui-sm font-medium"
          label="Creator records"
          options={tabs}
          value={activeView}
          onChange={setActiveView}
        />
      </div>

      <div
        className="mt-3"
        id={`creator-records-${activeTab.value}-panel`}
        role="tabpanel"
        aria-labelledby={`creator-records-${activeTab.value}-tab`}
        tabIndex={0}>
        {activeTab.content}
      </div>
    </section>
  );
}

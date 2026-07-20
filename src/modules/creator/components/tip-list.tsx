"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons/chevron-down";
import { cn } from "@/lib/cn";
import { formatNaira } from "@/lib/utils";
import type { Tip } from "@/types";

export function TipList({
  className,
  emptyMessage = "No tips yet. Share your link to receive your first one.",
  footer,
  id,
  labelledBy,
  tips,
}: {
  className?: string;
  emptyMessage?: string;
  footer?: React.ReactNode;
  id?: string;
  labelledBy?: string;
  tips: Tip[];
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-surface bg-white p-1 shadow-surface",
        className,
      )}
      id={id}
      role={labelledBy ? "tabpanel" : undefined}
      aria-labelledby={labelledBy}
      aria-live={labelledBy ? "polite" : undefined}>
      {tips.length ? (
        tips.map((tip) => <TipListRow key={tip.id} tip={tip} />)
      ) : (
        <p className="px-4 py-8 text-center text-muted-text">{emptyMessage}</p>
      )}
      {footer}
    </div>
  );
}

function TipListRow({ tip }: { tip: Tip }) {
  const [expanded, setExpanded] = useState(false);
  const noteId = `${tip.id}-note`;
  const content = (
    <>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-base font-medium text-white",
          tip.shade === "strong" && "bg-main-heading",
          tip.shade === "default" && "bg-body-text",
          tip.shade === "subtle" && "bg-muted-text",
        )}
        aria-hidden="true">
        {tip.initial}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-main-heading">
          {tip.anonymous ? "Anonymous" : tip.name}
        </h3>
        {tip.note ? (
          <div id={noteId}>
            {expanded ? null : (
              <p className="mt-px truncate text-ui-sm leading-normal text-muted-text">
                {tip.note}
              </p>
            )}
            <div className="t-acc-panel">
              <div className="t-acc-panel-inner">
                <p className="mt-px text-ui-sm leading-normal whitespace-normal text-muted-text">
                  {tip.note}
                </p>
                <p className="mt-1.5 text-xs break-all text-muted-text-2">
                  Reference {tip.reference}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-px truncate text-ui-sm text-muted-text-2 italic">
            No note
          </p>
        )}
      </div>
      <div className="shrink-0 text-right whitespace-nowrap">
        <strong className="block text-base font-medium text-main-heading">
          {formatNaira(tip.amount)}
        </strong>
        <span className="mt-px flex items-center justify-end gap-1 text-xs text-muted-text">
          <time dateTime={tip.createdAt}>{tip.time}</time>
          {tip.note ? (
            <span className="t-acc-chevron" aria-hidden="true">
              <ChevronDownIcon className="size-4" />
            </span>
          ) : null}
        </span>
      </div>
    </>
  );

  return (
    <article
      className="t-acc rounded-[10px] transition-colors duration-150 hover:bg-soft"
      data-open={tip.note && expanded ? "true" : "false"}>
      {tip.note ? (
        <button
          className="flex min-h-16 w-full cursor-pointer items-start gap-3 rounded-[10px] px-3.5 py-3 text-left max-phone:px-2.5"
          type="button"
          aria-controls={noteId}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}>
          {content}
          <span className="sr-only">
            {expanded ? "Collapse note" : "Read full note"}
          </span>
        </button>
      ) : (
        <div className="flex min-h-16 items-start gap-3 px-3.5 py-3 max-phone:px-2.5">
          {content}
        </div>
      )}
    </article>
  );
}

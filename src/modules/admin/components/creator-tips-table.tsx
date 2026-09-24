"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons/chevron-down";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { formatNaira } from "@/lib/utils";
import { formatAdminDateTime } from "@/modules/admin/format";
import type { CreatorTipEntry } from "../types";

const statusStyles: Record<CreatorTipEntry["status"], string> = {
  pending: "bg-soft text-muted-text",
  success: "bg-success-soft text-success",
  failed: "bg-danger-soft text-danger",
};

export function CreatorTipsTable({ tips }: { tips: CreatorTipEntry[] }) {
  return (
    <Table aria-label="Creator tips">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Supporter</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Tip details</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tips.map((tip) => (
          <CreatorTipRow key={tip.id} tip={tip} />
        ))}
      </TableBody>
    </Table>
  );
}

function CreatorTipRow({ tip }: { tip: CreatorTipEntry }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `creator-tip-${tip.id}-details`;
  const expandable = Boolean(
    tip.note ||
    tip.tipperEmail ||
    tip.providerReference ||
    tip.amountPaid !== null ||
    tip.providerSettlementAmount !== null,
  );
  const supporter = tip.anonymous
    ? "Anonymous"
    : tip.tipperName?.trim() || "Unnamed";

  function toggleExpanded() {
    if (expandable) setExpanded((current) => !current);
  }

  return (
    <>
      <TableRow
        className={cn(
          "transition-colors duration-150",
          expandable && "cursor-pointer hover:bg-soft",
        )}
        onClick={(event) => {
          const target = event.target;
          if (target instanceof Element && target.closest("a, button")) {
            return;
          }
          toggleExpanded();
        }}>
        <TableCell className="whitespace-nowrap text-body-text">
          <time dateTime={tip.createdAt}>
            {formatAdminDateTime(tip.createdAt)}
          </time>
        </TableCell>
        <TableCell className="font-medium whitespace-nowrap text-main-heading">
          {supporter}
        </TableCell>
        <TableCell className="whitespace-nowrap text-body-text">
          {formatNaira(tip.amount)}
        </TableCell>
        <TableCell>
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
              statusStyles[tip.status],
            )}>
            {tip.status}
          </span>
        </TableCell>
        <TableCell>
          <Link
            className="font-mono text-xs whitespace-nowrap text-main-heading hover:underline"
            href={`/admin/lookup?ref=${encodeURIComponent(tip.paymentReference)}`}>
            {tip.paymentReference}
          </Link>
        </TableCell>
        <TableCell className="w-12 py-2 text-right">
          {expandable && (
            <button
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-text transition-colors duration-150 hover:bg-line hover:text-main-heading"
              type="button"
              aria-controls={detailsId}
              aria-expanded={expanded}
              onClick={toggleExpanded}>
              <span
                className={cn(
                  "inline-flex origin-center transition-transform duration-250 ease-(--ease-smooth) motion-reduce:transition-none",
                  expanded && "-scale-y-100",
                )}
                aria-hidden="true">
                <ChevronDownIcon className="size-4 [&_path]:[vector-effect:non-scaling-stroke]" />
              </span>
              <span className="sr-only">
                {expanded ? "Hide tip details" : "Show tip details"}
              </span>
            </button>
          )}
        </TableCell>
      </TableRow>

      {expandable && (
        <TableRow aria-hidden={!expanded}>
          <TableCell className="p-0" colSpan={6}>
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                expanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}>
              <div className="overflow-hidden">
                <dl
                  className="grid gap-5 bg-soft px-4 py-3 sm:grid-cols-2 lg:grid-cols-3"
                  id={detailsId}>
                  <Detail label="Supporter email" value={tip.tipperEmail} />
                  <Detail
                    label="Provider reference"
                    value={tip.providerReference}
                    code
                  />
                  <Detail
                    label="Paid at provider"
                    value={
                      tip.amountPaid !== null
                        ? formatNaira(tip.amountPaid)
                        : null
                    }
                  />
                  <Detail
                    label="Settled at provider"
                    value={
                      tip.providerSettlementAmount !== null
                        ? formatNaira(tip.providerSettlementAmount)
                        : null
                    }
                  />
                  <Detail
                    className="sm:col-span-2 lg:col-span-3"
                    label="Note"
                    value={tip.note}
                  />
                </dl>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function Detail({
  label,
  value,
  code = false,
  className,
}: {
  label: string;
  value: string | null;
  code?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-muted-text">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-sm wrap-break-word whitespace-pre-wrap text-body-text",
          code && "font-mono text-xs",
        )}>
        {value || "—"}
      </dd>
    </div>
  );
}

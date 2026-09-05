"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@/components/icons/chevron-down";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAdminDateTime } from "@/modules/admin/format";
import type { AuditLogEntry } from "../types";

export function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <Table containerClassName="mt-3" aria-label="Audit trail">
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>When</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Action</TableHead>
          <TableHead className="w-12">
              <span className="sr-only">Entry details</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <AuditLogRow key={entry.id} entry={entry} />
        ))}
      </TableBody>
    </Table>
  );
}

function AuditLogRow({ entry }: { entry: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `audit-entry-${entry.id}-details`;
  const expandable = Boolean(
    entry.targetType || entry.targetId || entry.details,
  );

  function toggleExpanded() {
    if (expandable) setExpanded((current) => !current);
  }

  return (
    <>
      <TableRow
        className={cn(
          "t-acc transition-colors duration-150",
          expandable && "cursor-pointer hover:bg-soft",
        )}
        data-open={expanded ? "true" : "false"}
        onClick={toggleExpanded}>
        <TableCell className="font-mono text-xs text-muted-text">
          {entry.id}
        </TableCell>
        <TableCell className="whitespace-nowrap text-body-text">
          <time dateTime={entry.createdAt}>
            {formatAdminDateTime(entry.createdAt)}
          </time>
        </TableCell>
        <TableCell className="text-body-text">
          {entry.actorType}
          {entry.actorEmail && (
            <span className="block text-xs text-muted-text">
              {entry.actorEmail}
            </span>
          )}
        </TableCell>
        <TableCell className="font-medium text-main-heading">
          {entry.action}
        </TableCell>
        <TableCell className="w-12 py-2 text-right">
          {expandable && (
            <button
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-text transition-colors duration-150 hover:bg-line hover:text-main-heading"
              type="button"
              aria-controls={detailsId}
              aria-expanded={expanded}
              onClick={(event) => {
                event.stopPropagation();
                toggleExpanded();
              }}>
              <span className="t-acc-chevron" aria-hidden="true">
                <ChevronDownIcon className="size-4" />
              </span>
              <span className="sr-only">
                {expanded ? "Hide entry details" : "Show entry details"}
              </span>
            </button>
          )}
        </TableCell>
      </TableRow>

      {expandable && (
        <TableRow aria-hidden={!expanded}>
          <TableCell className="p-0" colSpan={5}>
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                expanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}>
              <div className="overflow-hidden">
                <dl
                  className="grid grid-cols-2 gap-5 bg-soft px-4 py-3 max-sm:grid-cols-1"
                  id={detailsId}>
                  <div>
                    <dt className="text-xs font-medium text-muted-text">
                      Target
                    </dt>
                    <dd className="mt-1 text-sm text-body-text">
                      {entry.targetType ?? "—"}
                      {entry.targetId && (
                        <span className="block break-all font-mono text-xs text-muted-text">
                          {entry.targetId}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-text">
                      Details
                    </dt>
                    <dd className="mt-1">
                      {entry.details ? (
                        <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap text-body-text">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-sm text-muted-text">—</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

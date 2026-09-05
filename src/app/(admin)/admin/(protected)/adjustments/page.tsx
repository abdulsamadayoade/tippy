import Link from "next/link";
import { listAdjustments, listCreatorOptions } from "@/modules/admin/queries";
import { AdjustmentModal } from "@/modules/admin/components/adjustment-modal";
import { formatNaira } from "@/lib/utils";
import { PageHeader } from "@/components/elements/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAdminDateTime } from "@/modules/admin/format";

export default async function AdminAdjustmentsPage() {
  const [adjustments, creators] = await Promise.all([
    listAdjustments(),
    listCreatorOptions(),
  ]);

  return (
    <section>
      <PageHeader
        title="Adjustments"
        description="Ledger entries for money moved outside the normal flow — refunds and reversals executed in the Monnify dashboard, plus audited manual corrections.">
        <AdjustmentModal creators={creators} />
      </PageHeader>

      <h2 className="mt-8 mb-3 font-semibold text-main-heading">
        Recent adjustments
      </h2>
      {adjustments.length === 0 ? (
        <p className="text-sm text-muted-text">None recorded yet.</p>
      ) : (
        <Table aria-label="Recent adjustments">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-body-text">
                  <time dateTime={entry.createdAt.toISOString()}>
                    {formatAdminDateTime(entry.createdAt)}
                  </time>
                </TableCell>
                <TableCell>
                  <Link
                    className="font-medium text-main-heading hover:underline"
                    href={`/admin/creators/${entry.creatorId}`}>
                    @{entry.username}
                  </Link>
                </TableCell>
                <TableCell className="text-body-text">
                  {entry.type.replace("_", " ")}
                </TableCell>
                <TableCell className="whitespace-nowrap text-body-text">
                  {formatNaira(entry.amount)}
                </TableCell>
                <TableCell className="max-w-70 text-muted-text">
                  {entry.reason}
                </TableCell>
                <TableCell className="text-muted-text">
                  {entry.createdBy}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

import Link from "next/link";
import { listAdjustments, listCreatorOptions } from "@/modules/admin/queries";
import { AdjustmentModal } from "@/modules/admin/components/adjustment-modal";
import { formatNaira } from "@/lib/utils";
import { PageHeader } from "@/components/elements/page-header";

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted-text">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Creator</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Reason</th>
                <th className="py-2 font-medium">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {adjustments.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-2 pr-4 whitespace-nowrap text-body-text">
                    {entry.createdAt.toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-4">
                    <Link
                      className="font-medium text-main-heading hover:underline"
                      href={`/admin/creators/${entry.creatorId}`}>
                      @{entry.username}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-body-text">
                    {entry.type.replace("_", " ")}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap text-body-text">
                    {formatNaira(entry.amount)}
                  </td>
                  <td className="max-w-70 py-2 pr-4 text-muted-text">
                    {entry.reason}
                  </td>
                  <td className="py-2 text-muted-text">{entry.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

import { getDashboardCounts } from "@/modules/admin/queries";
import { computeCreatorLiability } from "@/lib/monitor";
import { formatFeeRate } from "@/lib/fees";
import { getPlatformFeeTotals } from "@/lib/ledger";
import { getWalletBalance } from "@/lib/monnify";
import { DEFAULT_PLATFORM_FEE_BPS } from "@/data/constants";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { SweepButton } from "@/modules/admin/components/sweep-button";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl p-4 shadow-surface">
      <p className="text-xs font-medium text-muted-text">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-semibold tracking-tight",
          alert ? "text-danger" : "text-main-heading",
        )}>
        {value}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [counts, liability, wallet, fees] = await Promise.all([
    getDashboardCounts(),
    computeCreatorLiability().catch(() => null),
    getWalletBalance().catch(() => null),
    getPlatformFeeTotals().catch(() => null),
  ]);

  const shortfall = wallet !== null && liability !== null && wallet < liability;

  const platformFunds =
    wallet !== null && liability !== null ? wallet - liability : null;

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight text-main-heading">
        Operations
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <StatCard
          label="Monnify wallet"
          value={wallet !== null ? formatNaira(wallet) : "Unavailable"}
          alert={shortfall}
        />
        <StatCard
          label="Owed to creators"
          value={liability !== null ? formatNaira(liability) : "Unavailable"}
        />
        <StatCard
          label="Coverage"
          value={
            wallet !== null && liability !== null
              ? shortfall
                ? `Short by ${formatNaira(liability - wallet)}`
                : "Covered"
              : "—"
          }
          alert={shortfall}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <StatCard
          label="Wallet balance after creator obligations"
          value={platformFunds !== null ? formatNaira(platformFunds) : "—"}
          alert={platformFunds !== null && platformFunds < 0}
        />
        <StatCard
          label={`Fees accrued · all time (${formatFeeRate(DEFAULT_PLATFORM_FEE_BPS)})`}
          value={fees ? formatNaira(fees.allTime) : "Unavailable"}
        />
        <StatCard
          label="Fees accrued · 30d"
          value={fees ? formatNaira(fees.last30Days) : "Unavailable"}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3 max-sm:grid-cols-2">
        <StatCard
          label="Open payouts"
          value={counts.openPayouts}
          alert={counts.openPayouts > 0}
        />
        <StatCard
          label="Stale pending tips"
          value={counts.stalePendingTips}
          alert={counts.stalePendingTips > 0}
        />
        <StatCard
          label="Webhook errors (24h)"
          value={counts.webhookErrors24h}
          alert={counts.webhookErrors24h > 0}
        />
        <StatCard label="Suspended creators" value={counts.suspendedCreators} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-semibold text-main-heading">Maintenance</h2>
        <SweepButton />
      </div>
    </section>
  );
}

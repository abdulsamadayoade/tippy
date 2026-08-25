import Link from "next/link";
import { cn } from "@/lib/cn";
import { checkDatabase } from "@/lib/health";
import { pingMonnify } from "@/lib/monnify";
import { AutoRefresh } from "./auto-refresh";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/status" },
  title: "Status",
  description: "Live health of Tippy’s core systems.",
};

const withTimeout = <T,>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
        ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
      )}>
      {ok ? "Operational" : "Degraded"}
    </span>
  );
}

export default async function StatusPage() {
  // Each check is individually shielded — this page must never error, only
  // degrade. Build-time prerender may run without live services; the first
  // revalidation corrects the snapshot.
  const [databaseOk, paymentsOk] = await Promise.all([
    checkDatabase(3_000)
      .then(() => true)
      .catch(() => false),
    // getAccessToken's fetch has no timeout of its own.
    withTimeout(pingMonnify(), 5_000, false),
  ]);
  // Config presence only — no API call on a public page.
  const emailOk = Boolean(process.env.RESEND_API_KEY);

  const systems = [
    {
      name: "Database",
      description: "Stores accounts, tips, and payouts",
      ok: databaseOk,
    },
    {
      name: "Payments (Monnify)",
      description: "Processes tips and bank transfers",
      ok: paymentsOk,
    },
    {
      name: "Email (Resend)",
      description: "Sign-in links, receipts, and notifications",
      ok: emailOk,
    },
  ];
  const allOk = systems.every(({ ok }) => ok);

  const checkedAt = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <main className="flex flex-1 flex-col justify-end overflow-x-hidden pt-10">
      <section className="mx-auto mt-8 w-full max-w-130 rounded-t-[18px] bg-white p-5 pb-8 shadow-surface-raised">
        <h1 className="text-lg leading-page-heading font-medium tracking-display text-main-heading">
          Status
        </h1>
        <p className="text-ui-sm leading-normal text-body-text">
          Live health of Tippy&rsquo;s core systems.
        </p>

        <div
          className={cn(
            "mt-5 rounded-sm p-2 text-sm font-medium",
            allOk
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger",
          )}
          role="status">
          {allOk
            ? "All systems operational"
            : "Some systems are degraded — we’re on it"}
        </div>

        <div className="mt-4 flex flex-col rounded-surface bg-white shadow-surface">
          {systems.map(({ name, description, ok }, index) => (
            <div
              key={name}
              className={cn(
                "flex items-center justify-between gap-3 px-4.5 py-4",
                index > 0 && "border-t border-line",
              )}>
              <div className="min-w-0">
                <span className="block text-[15px] font-medium text-main-heading">
                  {name}
                </span>
                <span className="block text-ui-sm text-muted-text">
                  {description}
                </span>
              </div>
              <StatusPill ok={ok} />
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-text">
          Last checked {checkedAt} WAT · refreshes every minute
        </p>

        <div className="mt-7 border-t border-line pt-4">
          <p className="text-sm leading-normal text-body-text">
            Something look off? Visit{" "}
            <Link
              className="font-medium text-main-heading border-transparent border-2 border-dashed hover:border-body-text"
              href="/support">
              Support
            </Link>
          </p>
        </div>
      </section>
      <AutoRefresh />
    </main>
  );
}

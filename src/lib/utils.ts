import type { Tip } from "@/store/types";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function maskAccountNumber(accountNumber: string) {
  const lastFour = accountNumber.slice(-4);
  return `•••• ${lastFour}`;
}

function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    ...options,
  }).format(new Date(`${date}T12:00:00+01:00`));
}

function formatRelativeTime(iso: string, now = new Date()) {
  const elapsedMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.floor(elapsedMs / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDate(iso.slice(0, 10), { day: "numeric", month: "short" });
}

function getTipSummary(tips: Tip[]) {
  const total = tips.reduce((sum, tip) => sum + tip.amount, 0);
  const largest = tips.reduce(
    (currentLargest, tip) => Math.max(currentLargest, tip.amount),
    0,
  );
  const supporters = new Set(
    tips.map((tip) => (tip.anonymous ? tip.id : tip.name.toLowerCase())),
  ).size;

  return {
    average: tips.length ? Math.round(total / tips.length) : 0,
    count: tips.length,
    largest,
    supporters,
    total,
  };
}

export {
  formatNaira,
  maskAccountNumber,
  formatDate,
  formatRelativeTime,
  getTipSummary,
};

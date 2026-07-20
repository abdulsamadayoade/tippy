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

export { formatNaira, maskAccountNumber, formatDate, getTipSummary };

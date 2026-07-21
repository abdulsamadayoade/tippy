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

function getNextPayoutDate(now = new Date()) {
  const LAGOS_OFFSET_MS = 60 * 60 * 1000;
  const lagos = new Date(now.getTime() + LAGOS_OFFSET_MS);
  const daysUntilFriday = (5 - lagos.getUTCDay() + 7) % 7;
  const friday = new Date(
    Date.UTC(
      lagos.getUTCFullYear(),
      lagos.getUTCMonth(),
      lagos.getUTCDate() + daysUntilFriday,
    ),
  );
  return friday.toISOString().slice(0, 10);
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

export {
  formatNaira,
  maskAccountNumber,
  formatDate,
  formatRelativeTime,
  getNextPayoutDate,
};

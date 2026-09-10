const adminDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Africa/Lagos",
});

export function formatAdminDateTime(value: Date | string | number): string {
  return adminDateTimeFormatter.format(new Date(value));
}

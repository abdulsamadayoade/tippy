export function sanitizeAmountInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...fractionParts] = cleaned.split(".");
  const limitedWhole = whole.slice(0, 12);

  if (!cleaned.includes(".")) return limitedWhole;
  return `${limitedWhole}.${fractionParts.join("").slice(0, 2)}`;
}

export function formatAmountInput(value: string) {
  if (!value) return "";

  const [whole = "", fraction] = value.split(".");
  const formattedWhole = Number(whole || 0).toLocaleString("en-NG");

  return fraction === undefined
    ? formattedWhole
    : `${formattedWhole}.${fraction}`;
}

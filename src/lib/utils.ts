function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function maskAccountNumber(accountNumber: string) {
  const lastFour = accountNumber.slice(-4);
  return `•••• ${lastFour}`;
}

export { formatNaira, maskAccountNumber };

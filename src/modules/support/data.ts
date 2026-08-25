const QUESTIONS = [
  {
    heading: "I paid but the tip isn’t showing",
    body: "Tips usually settle within seconds. If you were debited and nothing appears after 10 minutes, our system re-checks the payment automatically. Still nothing after an hour? Write to us below with the receipt number from your email receipt.",
  },
  {
    heading: "When do payouts arrive?",
    body: "Withdrawals go out the moment you request them, and automatic payouts run every Friday. Bank transfers usually land within minutes; occasionally a bank takes a few hours.",
  },
  {
    heading: "I need a receipt",
    body: "If you entered an email when tipping, your receipt is already in your inbox — the receipt number on it (it starts with TIPPY-) is what support needs.",
  },
];

const LINKS = [
  { label: "Refund & Dispute Policy", href: "/refunds" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Status", href: "/status" },
];

const TOPICS = [
  { value: "tips", label: "Tips" },
  { value: "payouts", label: "Payouts" },
  { value: "account", label: "My account" },
  { value: "abuse", label: "Report abuse" },
  { value: "other", label: "Something else" },
];

export { QUESTIONS, LINKS, TOPICS };

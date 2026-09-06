import type { LegalSection } from "./types";

const terms: LegalSection[] = [
  {
    heading: "What Tippy is",
    paragraphs: [
      "Tippy gives creators a personal page where supporters can send them tips. Supporters pay through our payment partner, Monnify, and creators withdraw their balance to a Nigerian bank account.",
      "These terms are an agreement between you and Nightshift Industries, the company that operates Tippy.",
    ],
  },
  {
    heading: "Your account",
    paragraphs: [
      "You sign in with a link we email you — there's no password to manage. Keep your email account secure: anyone who can read your email can access your Tippy account. You're responsible for what happens under your account, and the details you give us (like your name and bank account) must be accurate and yours.",
    ],
  },
  {
    heading: "Tips",
    paragraphs: [
      "Tips are voluntary gifts from supporters to creators. They aren't payments for goods or services, and they're not refundable once settled, except where the law requires it. Card and bank details are collected and processed by Monnify — they never touch our servers.",
      "For the details — including duplicate charges and how to raise a dispute — see our Refund & Dispute Policy at [tippy.cash/refunds](/refunds).",
    ],
  },
  {
    heading: "Payouts",
    paragraphs: [
      "Settled tips build up your available balance. Once it reaches ₦5,000 you can withdraw to your verified bank account, or turn on automatic payouts to receive your full balance every Friday. If a payment behind your balance is reversed or found to be fraudulent, we may adjust your balance to match.",
    ],
  },
  {
    heading: "Fees",
    paragraphs: [
      "Creators receive the full tip amount. Monnify charges the supporter a separate payment-processing fee.",
      "Tippy adds no withdrawal fee. Monnify deducts its processing fee from the creator's selected withdrawal before the remaining amount is sent to their bank.",
    ],
  },
  {
    heading: "Fair use",
    paragraphs: [
      "Don't use Tippy for anything unlawful — including fraud, money laundering, or tipping yourself with stolen payment details. Keep notes and profile content respectful. We can suspend or close accounts that break these rules.",
    ],
  },
  {
    heading: "The service",
    paragraphs: [
      "We work hard to keep Tippy fast and available, but we provide it as-is and can't promise it will always be uninterrupted or error-free. We may update these terms as Tippy evolves; meaningful changes will be announced on this page.",
    ],
  },
];

const privacyPolicy: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "Tippy is operated by Nightshift Industries, which is responsible for the personal information described in this policy. When this page says 'we', that's who it means.",
    ],
  },
  {
    heading: "What we collect",
    paragraphs: ["We keep the minimum needed to run Tippy:"],
    list: [
      "Account details — your email, display name, username, category, bio, and avatar.",
      "Tip records — the amount, note, and (if the supporter chose to share it) their name and email.",
      "Payout details — your bank name, account number, and the account holder's name, verified with your bank.",
      "A session cookie that keeps you signed in. No advertising or cross-site tracking.",
    ],
  },
  {
    heading: "What we use it for",
    paragraphs: [
      "To run your tip page, process tips and payouts, email you sign-in links and tip notifications, send supporters the receipts they ask for, and keep the platform safe from fraud. That's it — we don't sell your data or use it for advertising.",
    ],
  },
  {
    heading: "Who we share it with",
    paragraphs: [
      "Only the services that make Tippy work, and only what each one needs: Monnify processes payments and bank transfers, Resend delivers our emails, and our hosting providers store the application and its database. Card details go directly to Monnify and are never stored by us.",
    ],
  },
  {
    heading: "Anonymous tips",
    paragraphs: [
      "When a supporter tips anonymously, their name is hidden from the creator everywhere in Tippy. The underlying payment record still exists, as payment regulations require.",
    ],
  },
  {
    heading: "How long we keep things",
    paragraphs: [
      "Your account data stays while your account is active. If you ask us to delete your account, we remove your profile and personal details; records of settled payments are kept only as long as financial regulations require.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can update your profile and bank details from your dashboard, tip anonymously as a supporter, and ask us to export or delete your data at any time.",
    ],
  },
];

const refundPolicy: LegalSection[] = [
  {
    heading: "The short version",
    paragraphs: [
      "Tips are voluntary gifts, and payments are processed by our payment partner, Monnify. Once a tip has settled — the money has reached the creator's Tippy balance — it isn't refundable, except where Nigerian law requires it or the payment itself clearly went wrong.",
    ],
  },
  {
    heading: "When we'll help reverse a payment",
    paragraphs: [
      "We'll investigate and, where the facts support it, reverse a payment if:",
    ],
    list: [
      "You were charged twice for the same tip.",
      "You were charged a different amount than the one you confirmed.",
      "Your card or account was used without your permission.",
      "You were debited but the tip never reached the creator.",
    ],
  },
  {
    heading: "How to raise a dispute",
    paragraphs: [
      "Email [hello@tippy.cash](mailto:hello@tippy.cash) within 14 days of the payment. Include the receipt number from your email receipt (it starts with TIPPY-) and a short description of what happened. We reply within 2 business days, and most disputes are resolved within 7.",
    ],
  },
  {
    heading: "Chargebacks",
    paragraphs: [
      "You can also dispute a charge through your bank. When that happens, Monnify investigates with the card network, and if the payment is reversed, the amount the tip added to the creator's balance is removed from it — the same adjustment our [Terms of Service](/terms) describe.",
    ],
  },
  {
    heading: "Creator payouts",
    paragraphs: [
      "Payouts to your bank account are final once your bank confirms the transfer. If a payout fails, the money returns to your Tippy balance automatically.",
    ],
  },
];

export { terms, privacyPolicy, refundPolicy };

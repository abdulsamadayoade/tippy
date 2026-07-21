import type { LegalSection } from "./types";

const terms: LegalSection[] = [
  {
    heading: "What Tippy is",
    paragraphs: [
      "Tippy gives creators a personal page where supporters can send them tips. Supporters pay through our payment partner, Monnify, and creators withdraw their balance to a Nigerian bank account.",
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
    ],
  },
  {
    heading: "Payouts",
    paragraphs: [
      "Settled tips build up your available balance. You can withdraw any amount to your verified bank account, or turn on automatic payouts to receive your full balance every Friday. If a payment behind your balance is reversed or found to be fraudulent, we may adjust your balance to match.",
    ],
  },
  {
    heading: "Fees",
    paragraphs: [
      "Tippy doesn't charge platform fees right now. If that ever changes, we'll say so clearly before it affects you.",
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
      "To run your tip page, process tips and payouts, email you sign-in links, and keep the platform safe from fraud. That's it — we don't sell your data or use it for advertising.",
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

export { terms, privacyPolicy };

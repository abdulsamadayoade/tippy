import { AutomaticPayoutsIcon } from "@/components/icons/automatic-payouts";
import { FanNotesIcon } from "@/components/icons/fan-notes";
import { PersonalLinkIcon } from "@/components/icons/personal-link";
import { MINIMUM_WITHDRAWAL } from "@/data/constants";
import { formatNaira } from "@/lib/utils";

const features = [
  {
    icon: PersonalLinkIcon,
    title: "Your own link",
    body: "Share tippy.cash/username anywhere and start collecting tips in minutes.",
  },
  {
    icon: AutomaticPayoutsIcon,
    title: "Automatic payouts",
    body: "Money lands in your bank automatically every Friday. Need it sooner? You can withdraw anytime.",
  },
  {
    icon: FanNotesIcon,
    title: "Notes from fans",
    body: "Every tip can carry a personal message from the people you reach.",
  },
];

const sampleNotes = [
  {
    amount: "₦5,000",
    avatarSeed: "sample-tobiloba",
    name: "Tobiloba",
    note: "Thanks for the late-night gear tips!",
  },
  {
    amount: "₦1,000",
    avatarSeed: "sample-anonymous",
    name: "Anonymous",
    note: "Your streams get me through night shifts.",
  },
];

const faqItems = [
  {
    question: "Do supporters need an account to send a tip?",
    answer:
      "No. Just open a creator's Tippy link, choose an amount and pay. You can also leave them a personal note — no account needed.",
  },
  {
    question: "Can I send a tip anonymously?",
    answer:
      "Yes. Turn on “Tip privately” before you pay, and the creator will see “Anonymous” instead of your name. You can still add your email if you’d like a receipt.",
  },
  {
    question: "Does Tippy charge any fees?",
    answer:
      "Creating a Tippy page is free, and creators receive the full tip amount. Payment processing and withdrawal fees are charged separately, and you’ll always see any fees before you pay or withdraw.",
    link: { href: "/terms", label: "See how fees work" },
  },
  {
    question: "How and when can creators withdraw their money?",
    answer: `Once you've linked a Nigerian bank account and completed verification, you can withdraw anytime your available balance reaches ${formatNaira(MINIMUM_WITHDRAWAL)}. You can also turn on automatic payouts and have your eligible balance sent to your bank every Friday.`,
  },
  {
    question: "Will I receive a payment receipt?",
    answer:
      "Yes, as long as you add your email before paying. We'll send you a receipt once the payment is confirmed, even if you tipped anonymously.",
  },
  {
    question: "What if I'm charged but my tip doesn't appear?",
    answer:
      "Give it a few minutes to confirm and don't try paying again just yet. If it still doesn't show up, contact support with the amount, time of payment, creator's username and payment reference if you have it.",
    link: { href: "/support", label: "Get help with a payment" },
  },
];

export { features, sampleNotes, faqItems };

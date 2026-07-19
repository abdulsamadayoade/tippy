import { BankBuildingIcon } from "@/components/icons/bank-building";
import { CopyIcon } from "@/components/icons/copy";
import { MailIcon } from "@/components/icons/mail";

const features = [
  {
    icon: CopyIcon,
    title: "Your own link",
    body: "Share tippy.cash/you anywhere and start collecting tips in minutes.",
  },
  {
    icon: BankBuildingIcon,
    title: "Automatic payouts",
    body: "Money lands in your bank every Friday — no manual withdrawals.",
  },
  {
    icon: MailIcon,
    title: "Notes from fans",
    body: "Every tip can carry a personal message from the people you reach.",
  },
];

const sampleNotes = [
  {
    amount: "₦5,000",
    initial: "T",
    name: "Tobiloba",
    note: "Thanks for the late-night gear tips!",
  },
  {
    amount: "₦1,000",
    initial: "?",
    name: "Anonymous",
    note: "Your streams get me through night shifts.",
  },
];

export { features, sampleNotes };

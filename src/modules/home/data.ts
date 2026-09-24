import { MailIcon } from "@/components/icons/mail";
import { LinkIcon } from "@/components/icons/link";
import { PaySuccessIcon } from "@/components/icons/pay-success";

const features = [
  {
    icon: LinkIcon,
    title: "Your own link",
    body: "Share tippy.cash/you anywhere and start collecting tips in minutes.",
  },
  {
    icon: PaySuccessIcon,
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

export { features, sampleNotes };

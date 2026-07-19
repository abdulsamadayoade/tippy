import { BankAccount, Tip } from "@/store/types";

const sampleCreator = {
  firstName: "Abdulsamad",
  name: "Abdulsamad Ayoade",
  handle: "@abdullllsamad",
  username: "abdul",
  category: "Software Engineer",
  bio: "Nothing really that much, this is just a sample bio",
  tipUrl: "tippy.cash/abdul",
  profilePhotoUrl: "/images/user.png",
};

const initialPayoutAccount: BankAccount = {
  bank: "GTBank",
  accountName: "Ada Obi",
  accountNumber: "0154724021",
};

const initialTips: Tip[] = [
  {
    id: "tip-tobiloba",
    name: "Tobiloba",
    amount: 5000,
    note: "MVP behaviour — thanks for the late-night gear tips!",
    anonymous: false,
    initial: "T",
    shade: "strong",
    time: "2m ago",
    createdAt: "2026-07-15T17:08:00+01:00",
    reference: "TIPPY·9412",
  },
  {
    id: "tip-anonymous",
    name: "Anonymous",
    amount: 1000,
    note: "Your streams get me through night shifts.",
    anonymous: true,
    initial: "?",
    shade: "subtle",
    time: "11m ago",
    createdAt: "2026-07-15T16:59:00+01:00",
    reference: "TIPPY·9378",
  },
  {
    id: "tip-zainab",
    name: "Zainab",
    amount: 500,
    note: "Small tip, big love.",
    anonymous: false,
    initial: "Z",
    shade: "default",
    time: "1h ago",
    createdAt: "2026-07-15T16:10:00+01:00",
    reference: "TIPPY·9251",
  },
  {
    id: "tip-chidi",
    name: "Chidi",
    amount: 2000,
    note: "Been here since 200 followers. Keep going!",
    anonymous: false,
    initial: "C",
    shade: "strong",
    time: "3h ago",
    createdAt: "2026-07-15T14:10:00+01:00",
    reference: "TIPPY·9104",
  },
];

export { sampleCreator, initialPayoutAccount, initialTips };

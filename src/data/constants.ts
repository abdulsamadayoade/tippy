const MINIMUM_TIP = 100;
const MAXIMUM_TIP = 1_000_000;

const MAXIMUM_NOTE_LENGTH = 140;

const NEXT_PAYOUT_DATE = "2026-07-24";

const ACCOUNT_NUMBER_LENGTH = 10;

const BANKS = [
  "Access Bank",
  "Ecobank",
  "Fidelity Bank",
  "First Bank",
  "FCMB",
  "GTBank",
  "Kuda",
  "Moniepoint",
  "Opay",
  "Palmpay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC",
  "Sterling Bank",
  "UBA",
  "Union Bank",
  "Wema Bank",
  "Zenith Bank",
] as const;

export {
  MAXIMUM_TIP,
  MINIMUM_TIP,
  MAXIMUM_NOTE_LENGTH,
  NEXT_PAYOUT_DATE,
  ACCOUNT_NUMBER_LENGTH,
  BANKS,
};

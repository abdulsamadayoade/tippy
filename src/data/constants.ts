const MINIMUM_TIP = 100;
const MAXIMUM_TIP = 1_000_000;

const MAXIMUM_NOTE_LENGTH = 140;
const MINIMUM_WITHDRAWAL = 5_000;
const DEFAULT_PLATFORM_FEE_BPS = 250;

const ACCOUNT_NUMBER_LENGTH = 10;
const OVERVIEW_RECENT_TIPS = 5;

const BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Ecobank", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank", code: "011" },
  { name: "FCMB", code: "214" },
  { name: "GTBank", code: "058" },
  { name: "Kuda", code: "50211" },
  { name: "Moniepoint", code: "50515" },
  { name: "Opay", code: "999992" },
  { name: "Palmpay", code: "999991" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Sterling Bank", code: "232" },
  { name: "UBA", code: "033" },
  { name: "Union Bank", code: "032" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
] as const;

export {
  MAXIMUM_TIP,
  MINIMUM_TIP,
  MAXIMUM_NOTE_LENGTH,
  MINIMUM_WITHDRAWAL,
  DEFAULT_PLATFORM_FEE_BPS,
  ACCOUNT_NUMBER_LENGTH,
  OVERVIEW_RECENT_TIPS,
  BANKS,
};

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const BIO_MAX_LENGTH = 160;

const RESERVED_USERNAMES = [
  "admin",
  "api",
  "app",
  "dashboard",
  "help",
  "login",
  "logout",
  "onboarding",
  "overview",
  "payouts",
  "privacy",
  "refunds",
  "register",
  "settings",
  "status",
  "support",
  "terms",
  "tippy",
  "tips",
  "www",
];

export {
  USERNAME_PATTERN,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  RESERVED_USERNAMES,
};

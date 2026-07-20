const CATEGORIES = [
  "Streamer",
  "Musician",
  "Artist",
  "Writer",
  "Podcaster",
  "Video creator",
  "Comedian",
  "Photographer",
  "Software Engineer",
  "Designer",
  "Educator",
  "Other",
] as const;

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const BIO_MAX_LENGTH = 160;

export {
  CATEGORIES,
  USERNAME_PATTERN,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
};

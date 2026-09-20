const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 120],
  },
};

export default config;

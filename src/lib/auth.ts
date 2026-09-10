import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, admin, twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";
import { sendMagicLinkEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg" }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  rateLimit: {
    customStorage: {
      get: async () => null,
      set: async () => undefined,
      consume: async (key, rule) => consumeRateLimit(key, rule),
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        await sendMagicLinkEmail({ email, url, token });
      },
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    twoFactor({
      issuer: "Tippy",
      skipVerificationOnEnable: false,
      allowPasswordless: true,
    }),
    nextCookies(),
  ],
});

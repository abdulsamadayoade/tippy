import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  adminClient,
  twoFactorClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), adminClient(), twoFactorClient()],
});

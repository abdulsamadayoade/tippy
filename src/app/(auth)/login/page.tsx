import { SignIn } from "@/modules/auth/components/sign-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Tippy with a one-tap email link — no password to remember.",
};

export default function Login() {
  return <SignIn mode="sign-in" />;
}

import { SignIn } from "@/modules/auth/components/sign-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create your Tippy account with a one-tap email link — no password to remember.",
};

export default function Register() {
  return <SignIn mode="sign-up" />;
}

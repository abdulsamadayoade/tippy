import { Profile } from "@/modules/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tip",
  description: `Send your favorite creator a secure tip in naira and add a personal note.`,
};

export default function Page() {
  return <Profile />;
}

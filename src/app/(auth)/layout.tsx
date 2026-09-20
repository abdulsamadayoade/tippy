import { Nav } from "@/components/layout/nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <Nav />
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        {children}
      </div>
    </div>
  );
}

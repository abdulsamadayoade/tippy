import { Nav } from "@/components/layout/nav";
import { AuthNavActions } from "@/modules/auth/components/nav-actions";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <Nav>
        <AuthNavActions />
      </Nav>
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        {children}
      </div>
    </div>
  );
}

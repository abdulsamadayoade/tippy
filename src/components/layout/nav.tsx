import Link from "next/link";
import { Logo } from "../elements/logo";

export function Nav({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="mx-auto flex w-full max-w-180 items-center justify-between px-5.5 py-5">
      <Link href="/">
        <Logo />
      </Link>
      {children}
    </nav>
  );
}

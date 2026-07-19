import Link from "next/link";
import { Logo } from "../elements/logo";

export function Nav() {
  return (
    <nav className="mx-auto flex w-full min-w-0 max-w-160 items-center justify-between px-5.5 py-5">
      <Link href="/">
        <Logo />
      </Link>
      <Link
        className="bg-white px-3 py-0.5 items-center rounded-full text-sm font-medium text-main-heading"
        href="/login">
        Login
      </Link>
    </nav>
  );
}

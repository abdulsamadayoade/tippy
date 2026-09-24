import Link from "next/link";
import { AppInstall } from "../elements/app-install";

const links = [
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
  { href: "/refunds", label: "Refunds" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="mx-auto w-full text-xs text-main-heading max-w-180 px-5.5 py-8 text-center">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1"
        aria-label="Site">
        {links.map(({ href, label }, index) => (
          <span key={href} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden="true">·</span>}
            <Link className="hover:underline" href={href}>
              {label}
            </Link>
          </span>
        ))}
      </nav>
      <AppInstall className="mt-4" />
      <p className="mt-2">© {new Date().getFullYear()} Very Serious Company</p>
    </footer>
  );
}

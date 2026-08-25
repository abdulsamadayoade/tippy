import Link from "next/link";

const links = [
  { href: "/status", label: "Status" },
  { href: "/support", label: "Support" },
  { href: "/refunds", label: "Refunds" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-180 px-5.5 py-8 text-center">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-muted-text"
        aria-label="Site">
        {links.map(({ href, label }, index) => (
          <span key={href} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden="true">·</span> : null}
            <Link className="hover:underline" href={href}>
              {label}
            </Link>
          </span>
        ))}
      </nav>
      <p className="mt-2 text-xs text-muted-text-2">
        © {new Date().getFullYear()} Nightshift Industries
      </p>
    </footer>
  );
}

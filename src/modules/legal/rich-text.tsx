import Link from "next/link";
import type { ReactNode } from "react";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

const linkClassName =
  "font-medium text-main-heading border-transparent border-2 border-dashed hover:border-body-text";

// Renders legal copy with markdown-style [label](href) links. Internal paths
// use next/link; mailto and external URLs fall back to a plain anchor.
export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [full, label, href] = match;

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      href.startsWith("/") ? (
        <Link key={match.index} className={linkClassName} href={href}>
          {label}
        </Link>
      ) : (
        <a key={match.index} className={linkClassName} href={href}>
          {label}
        </a>
      ),
    );

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export type PillNavigationItem = {
  href: string;
  label: string;
  id?: string;
};

type PillNavigationProps = {
  links: readonly PillNavigationItem[];
  ariaLabel: string;
  className?: string;
};

function positionPill(
  pill: HTMLSpanElement,
  link: HTMLAnchorElement,
  animate: boolean,
) {
  if (!animate) {
    const previousTransition = pill.style.transition;
    pill.style.transition = "none";
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    pill.style.width = `${link.offsetWidth}px`;
    void pill.offsetWidth;
    pill.style.transition = previousTransition;
    return;
  }

  pill.style.transform = `translateX(${link.offsetLeft}px)`;
  pill.style.width = `${link.offsetWidth}px`;
}

function findActiveHref(pathname: string, links: readonly PillNavigationItem[]) {
  return links.reduce<string | undefined>((activeHref, link) => {
    const matches =
      pathname === link.href || pathname.startsWith(`${link.href}/`);

    if (!matches || (activeHref && activeHref.length >= link.href.length)) {
      return activeHref;
    }

    return link.href;
  }, undefined);
}

export function PillNavigation({
  links,
  ariaLabel,
  className,
}: PillNavigationProps) {
  const pathname = usePathname();
  const pillRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const hasMeasured = useRef(false);
  const activeHref = findActiveHref(pathname, links) ?? links[0]?.href;

  useLayoutEffect(() => {
    if (!activeHref) return;

    const pill = pillRef.current;
    const link = linkRefs.current.get(activeHref);
    if (!pill || !link) return;

    positionPill(pill, link, hasMeasured.current);
    hasMeasured.current = true;
  }, [activeHref]);

  useEffect(() => {
    const snapPillToActiveLink = () => {
      if (!activeHref) return;

      const pill = pillRef.current;
      const link = linkRefs.current.get(activeHref);
      if (pill && link) positionPill(pill, link, false);
    };

    window.addEventListener("resize", snapPillToActiveLink);
    return () => window.removeEventListener("resize", snapPillToActiveLink);
  }, [activeHref]);

  return (
    <nav
      className={cn("text-ui-sm font-medium", className)}
      aria-label={ariaLabel}>
      <div className="relative inline-flex items-center gap-0.75 rounded-[48px] bg-line p-0.75">
        <span
          ref={pillRef}
          className="pointer-events-none absolute top-0.75 left-0 z-0 h-7.5 w-0 rounded-[48px] bg-white transition-[transform,width] duration-250 ease-(--ease-smooth) will-change-[transform,width] motion-reduce:transition-none"
          aria-hidden="true"
        />
        {links.map(({ href, label, id }) => {
          const active = href === activeHref;

          return (
            <Link
              ref={(element) => {
                if (element) linkRefs.current.set(href, element);
                else linkRefs.current.delete(href);
              }}
              className={cn(
                "relative z-1 h-7.5 cursor-pointer rounded-[48px] px-3 pt-1.5 pb-1 text-center whitespace-nowrap text-body-text/80 transition-colors duration-250 ease-(--ease-smooth) hover:text-main-heading motion-reduce:transition-none",
                active && "text-main-heading",
              )}
              href={href}
              id={id}
              key={href}
              aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

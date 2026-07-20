"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/tips", label: "Tips" },
  { href: "/payouts", label: "Payouts" },
] as const;

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

export function CreatorNavigation() {
  const pathname = usePathname();
  const pillRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const hasMeasured = useRef(false);
  const activeHref =
    links.find(({ href }) => pathname === href)?.href ?? "/overview";

  useLayoutEffect(() => {
    const pill = pillRef.current;
    const link = linkRefs.current.get(activeHref);
    if (!pill || !link) return;

    positionPill(pill, link, hasMeasured.current);
    hasMeasured.current = true;
  }, [activeHref]);

  useEffect(() => {
    const snapPillToActiveLink = () => {
      const pill = pillRef.current;
      const link = linkRefs.current.get(activeHref);
      if (pill && link) positionPill(pill, link, false);
    };

    window.addEventListener("resize", snapPillToActiveLink);
    return () => window.removeEventListener("resize", snapPillToActiveLink);
  }, [activeHref]);

  return (
    <nav
      className="ml-1.5 text-[13px] font-medium max-[680px]:order-3 max-[680px]:ml-0 max-[680px]:w-full max-[680px]:text-center"
      aria-label="Creator sections">
      <div className="relative inline-flex items-center gap-0.75 rounded-[48px] bg-(--color-6) p-0.75">
        <span
          ref={pillRef}
          className="pointer-events-none absolute top-0.75 left-0 z-0 h-7.5 w-0 rounded-[48px] bg-white transition-[transform,width] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,width] motion-reduce:transition-none"
          aria-hidden="true"
        />
        {links.map(({ href, label }) => {
          const active = href === activeHref;

          return (
            <Link
              ref={(element) => {
                if (element) linkRefs.current.set(href, element);
                else linkRefs.current.delete(href);
              }}
              className={cn(
                "relative z-1 h-7.5 cursor-pointer rounded-[48px] px-3 pt-1.5 pb-1 text-center text-body-text/80 transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-main-heading motion-reduce:transition-none",
                active && "text-main-heading",
              )}
              href={href}
              id={`creator-${href.slice(1)}-link`}
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

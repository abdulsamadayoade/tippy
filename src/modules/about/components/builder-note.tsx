import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { builderSocialLinks } from "../data";

export function BuilderNote() {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3.5">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-soft shadow-surface">
          <Image
            src="/images/abdul-dp.jpg"
            alt="Abdulsamad Ayoade"
            width={64}
            height={64}
            className="size-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-medium tracking-display text-main-heading">
            Abdulsamad Ayoade
          </h3>
          <p className="mt-0.5 text-ui-sm text-muted-text">Builder of Tippy</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-body-text">
        I&rsquo;m building Tippy to make it easier to support the people whose
        work you enjoy. A simple link, a tip in naira and a personal note can be
        a small reminder that someone values what you do.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <Link
          href="/abdul"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-main-heading underline decoration-main-heading/30 underline-offset-4 hover:decoration-main-heading">
          My Tippy page
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
        <nav
          className="flex items-center gap-2"
          aria-label="Abdul’s social links">
          {builderSocialLinks.map(({ label, title, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (opens in a new tab)`}
              title={title}
              className="inline-flex size-11 items-center justify-center rounded-full bg-soft text-body-text transition-colors duration-150 hover:bg-line hover:text-main-heading motion-reduce:transition-none">
              <Icon className="size-4.5" aria-hidden="true" focusable="false" />
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

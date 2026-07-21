import Link from "next/link";
import type { LegalPageProps } from "./types";

export function LegalPage({
  title,
  intro,
  updated,
  sections,
  crossLink,
}: LegalPageProps) {
  return (
    <main className="flex flex-1 flex-col justify-end overflow-x-hidden pt-10">
      <section className="mx-auto mt-8 w-full max-w-130 rounded-t-[18px] bg-white p-5 pb-8 shadow-surface-raised">
        <h1 className="text-lg leading-page-heading font-medium tracking-display text-main-heading">
          {title}
        </h1>
        <p className="mt-1 text-ui-sm leading-normal text-body-text">{intro}</p>
        <p className="mt-1.5 text-xs text-muted-text">Last updated {updated}</p>

        {sections.map(({ heading, paragraphs, list }) => (
          <section key={heading}>
            <h2 className="mt-6 text-base font-medium text-main-heading">
              {heading}
            </h2>
            {paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-1.5 text-sm leading-normal text-body-text">
                {paragraph}
              </p>
            ))}
            {list ? (
              <ul className="mt-1.5 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-normal text-body-text">
                {list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <div className="mt-7 border-t border-line pt-4">
          <p className="text-sm leading-normal text-body-text">
            Questions? Write to us at{" "}
            <a
              className="font-medium text-main-heading hover:underline"
              href="mailto:hello@tippy.cash">
              hello@tippy.cash
            </a>
            . Also read our{" "}
            <Link
              className="font-medium text-main-heading hover:underline"
              href={crossLink.href}>
              {crossLink.label}
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { RichText } from "./rich-text";
import type { LegalPageProps } from "./types";

export function LegalPage({
  title,
  intro,
  updated,
  sections,
  crossLinks,
}: LegalPageProps) {
  return (
    <main className="flex flex-1 flex-col justify-end overflow-x-hidden pt-10">
      <section className="mx-auto mt-8 w-full max-w-130 rounded-t-[18px] bg-white p-5 pb-8 shadow-surface-raised">
        <h1 className="text-lg leading-page-heading font-medium tracking-display text-main-heading">
          {title}
        </h1>
        <p className="mt-1 text-ui-sm leading-normal text-body-text">
          <RichText text={intro} />
        </p>
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
                <RichText text={paragraph} />
              </p>
            ))}
            {list ? (
              <ul className="mt-1.5 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-normal text-body-text">
                {list.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <div className="mt-7 border-t border-line pt-4">
          <p className="text-sm leading-normal text-body-text">
            Tippy is operated by{" "}
            <span className="border-dashed border-white border-2 px-0.5 bg-body-text text-white">
              Nightshift Industries
            </span>
            . Questions? Write to us at{" "}
            <a
              className="font-medium text-main-heading border-transparent border-2 border-dashed hover:border-body-text"
              href="mailto:hello@tippy.cash">
              hello@tippy.cash
            </a>
            . Also read our{" "}
            {crossLinks.map(({ label, href }, index) => (
              <span key={href}>
                {index > 0
                  ? index === crossLinks.length - 1
                    ? " and "
                    : ", "
                  : ""}
                <Link
                  className="font-medium text-main-heading border-transparent border-2 border-dashed hover:border-body-text"
                  href={href}>
                  {label}
                </Link>
              </span>
            ))}
            .
          </p>
        </div>
      </section>
    </main>
  );
}

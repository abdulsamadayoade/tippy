import Link from "next/link";
import { ContactForm } from "./components/contact-form";
import { LINKS, QUESTIONS } from "./data";

export function Support() {
  return (
    <main className="flex flex-1 flex-col justify-end overflow-x-hidden pt-10">
      <section className="mx-auto mt-8 w-full max-w-130 rounded-t-[18px] bg-white p-5 pb-8 shadow-surface-raised">
        <h1 className="text-lg leading-page-heading font-medium tracking-display text-main-heading">
          Support
        </h1>
        <p className="text-ui-sm leading-normal text-body-text">
          Stuck on something? Here&rsquo;s how to get help — and how to reach a
          human.
        </p>

        {QUESTIONS.map(({ heading, body }) => (
          <section key={heading}>
            <h2 className="mt-6 text-base font-medium text-main-heading">
              {heading}
            </h2>
            <p className="mt-1.5 text-sm leading-normal text-body-text">
              {body}
            </p>
          </section>
        ))}

        <section>
          <h2 className="mt-6 text-base font-medium text-main-heading">
            Contact us
          </h2>
          <ContactForm />
        </section>

        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm leading-normal text-body-text">
            Also read our{" "}
            {LINKS.map(({ label, href }, index) => (
              <span key={href}>
                {index > 0 ? (index === LINKS.length - 1 ? " and " : ", ") : ""}
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

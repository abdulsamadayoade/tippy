import Link from "next/link";
import { Accordion } from "@/components/ui/accordion";
import { faqItems } from "../data";

export function Faq() {
  return (
    <section
      className="mx-auto mt-16 mb-8 w-full max-w-180 px-5"
      aria-labelledby="home-faq-heading">
      <h2
        id="home-faq-heading"
        className="text-center text-2xl font-semibold tracking-display text-main-heading">
        Frequently asked questions
      </h2>
      <div className="mx-auto mt-6 max-w-2xl rounded-3xl bg-card-bg p-1 shadow-surface">
        {faqItems.map(({ question, answer, link }) => (
          <Accordion key={question} title={question}>
            <p>{answer}</p>
            {link && (
              <Link
                href={link.href}
                className="mt-3 inline-block font-medium text-main-heading underline underline-offset-4 hover:text-body-text">
                {link.label}
              </Link>
            )}
          </Accordion>
        ))}
      </div>
      <p className="mt-5 text-center text-sm text-muted-text">
        Still need help?{" "}
        <Link
          href="/support"
          className="font-medium text-main-heading underline underline-offset-4 hover:text-body-text">
          Contact support
        </Link>
        .
      </p>
    </section>
  );
}

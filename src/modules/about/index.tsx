import Link from "next/link";
import { MonnifyLogo } from "@/components/elements/monnify-logo";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Footer } from "@/components/layout/footer";
import { ButtonLink } from "@/components/ui/button";
import { BuilderNote } from "./components/builder-note";
import { steps } from "./data";

function About() {
  return (
    <>
      <main className="mx-auto w-full max-w-160 flex-1 px-5 pt-12 pb-4 sm:pt-16">
        <header className="mx-auto max-w-130 text-center">
          <h1 className="text-4xl font-semibold tracking-display text-balance text-main-heading">
            Good work deserves a{" "}
            <span className="relative inline-block whitespace-nowrap">
              thank you.
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 200 18"
                fill="none"
                className="pointer-events-none absolute -bottom-2 left-0 h-4 w-[94%] overflow-visible text-[#b87529] dark:text-[#efc478]">
                <path
                  d="M3 10C32 4 55 14 83 9S130 5 152 9S181 12 197 6"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-4 text-base text-pretty text-body-text">
            Tippy helps Nigerian creators receive tips in naira, through one
            link they can share anywhere.
          </p>
        </header>

        <article className="mt-10 overflow-hidden rounded-3xl bg-card-bg shadow-surface-raised">
          <section className="p-6 sm:p-8" aria-labelledby="about-why">
            <h2
              id="about-why"
              className="text-base font-medium tracking-display text-main-heading">
              A little support goes a long way
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-body-text">
              <p>
                The writer who helps you see things differently. The musician
                you keep coming back to. The person whose tutorials finally make
                it click. There are people making things you value every day.
              </p>
              <p>
                Tippy gives you a simple way to say thanks, and gives creators a
                place to receive that support. A personal page, a tip in naira
                and a few kind words. That&rsquo;s the idea.
              </p>
            </div>
          </section>

          <section
            className="border-t border-divider p-6 sm:p-8"
            aria-labelledby="about-how">
            <h2
              id="about-how"
              className="text-lg font-medium tracking-display text-main-heading">
              From your link to your bank
            </h2>
            <ol className="mt-5 space-y-5">
              {steps.map(({ title, body }, index) => (
                <li key={title} className="flex gap-3.5">
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-medium text-main-heading tabular-nums"
                    aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-sm font-medium text-main-heading">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-body-text">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="border-t border-divider p-6 sm:p-8"
            aria-labelledby="about-payments">
            <h2
              id="about-payments"
              className="text-lg font-medium tracking-display text-main-heading">
              A clear path for your money
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-body-text">
              <p>
                Payments are processed by Monnify. Supporters enter their
                payment details on Monnify&rsquo;s checkout; Tippy does not
                store card details.
              </p>
              <p>
                Tippy credits the full tip amount to the creator&rsquo;s
                balance. Payment processing and bank transfer fees are separate.
                Our{" "}
                <Link
                  href="/terms"
                  className="font-medium text-main-heading underline decoration-main-heading/30 underline-offset-4 hover:decoration-main-heading">
                  terms explain the fees
                </Link>
                , and our{" "}
                <Link
                  href="/refunds"
                  className="font-medium text-main-heading underline decoration-main-heading/30 underline-offset-4 hover:decoration-main-heading">
                  refund policy
                </Link>{" "}
                explains what to do if a payment goes wrong.
              </p>
            </div>
            <a
              href="https://monnify.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Monnify (opens in a new tab)"
              className="mt-5 inline-flex items-center gap-2 text-xs text-muted-text hover:text-main-heading">
              Payments powered by
              <MonnifyLogo className="h-3.5 w-auto text-main-heading" />
            </a>
          </section>

          <section
            className="border-t border-divider p-6 sm:p-8"
            aria-labelledby="about-company">
            <h2
              id="about-company"
              className="text-lg font-medium tracking-display text-main-heading">
              Who&rsquo;s behind Tippy?
            </h2>
            <BuilderNote />
            <p className="mt-6 border-t border-divider pt-4 text-sm leading-relaxed text-body-text">
              Tippy is operated by{" "}
              <a
                href="https://veryseriouscompany.co"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-main-heading underline decoration-main-heading/30 underline-offset-4 hover:decoration-main-heading">
                Very Serious Company
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              . If you have a question, an idea or something that needs fixing,
              we&rsquo;d like to hear from you.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <a
                href="mailto:hello@tippy.cash"
                className="font-medium text-main-heading underline decoration-main-heading/30 underline-offset-4 hover:decoration-main-heading">
                hello@tippy.cash
              </a>
              <Link
                href="/support"
                className="inline-flex items-center gap-1.5 font-medium text-main-heading hover:underline">
                Get support
                <ArrowRightIcon className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </article>

        <section className="px-2 pt-10 pb-4 text-center">
          <h2 className="text-lg font-medium tracking-display text-balance text-main-heading">
            Give your supporters a way to say thanks.
          </h2>
          <ButtonLink href="/register" className="mt-5">
            Claim my link
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </ButtonLink>
        </section>
      </main>
      <Footer />
    </>
  );
}

export { About };

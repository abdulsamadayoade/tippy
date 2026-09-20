"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/cn";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CloseIcon } from "@/components/icons/close";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProductPreview } from "./components/product-preview";
import { Features } from "./components/features";
import { Secured } from "@/components/elements/secured";

function withViewTransition(update: () => void) {
  if (
    !("startViewTransition" in document) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}

export function Home() {
  const [claiming, setClaiming] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const canContinue = username.trim().length > 3;

  function openClaimFlow() {
    withViewTransition(() => setClaiming(true));
  }

  function closeClaimFlow() {
    withViewTransition(() => {
      setClaiming(false);
      setUsername("");
      setError("");
    });
  }

  function submitUsername(event: SubmitEvent<HTMLFormElement>) {
    if (canContinue) return;

    event.preventDefault();
    setError("Choose a username with at least 4 characters.");
    inputRef.current?.focus();
  }

  return (
    <>
      <Nav>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <ButtonLink variant="secondary" size="xs" href="/login">
            Login
          </ButtonLink>
          <div className="flex shrink-0 items-center gap-2">
            <ButtonLink variant="secondary" size="xs" href="/register">
              Claim my Link
            </ButtonLink>
            <ThemeToggle />
          </div>
        </div>
      </Nav>

      <main className="flex min-h-screen w-full max-w-full flex-col py-16">
        <section className="mx-auto flex w-full max-w-180 flex-1 flex-col items-center px-5 text-center">
          <h1 className="my-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance text-main-heading">
            Get{" "}
            <div className="inline-block bg-primary text-white px-2 py-0.5">
              tipped
            </div>{" "}
            by the people who
            <div className="inline-block bg-primary text-white px-2 py-0.5">
              love your work.
            </div>
          </h1>
          <p className="max-w-lg text-base font-medium leading-normal text-body-text/75 text-pretty">
            Tippy gives you one simple link to collect tips in naira — notes
            from your fans included, payouts straight to your bank. No more
            dropping your account number in the comments.
          </p>
          <div className="mt-7 flex w-full flex-wrap items-start justify-center gap-2.5">
            {claiming ? (
              <form
                className="w-72 max-w-full [view-transition-name:claim-control]"
                action="/register"
                method="get"
                autoComplete="off"
                noValidate
                onSubmit={submitUsername}>
                <TextInput
                  ref={inputRef}
                  label="Choose your username for https://tippy.cash/"
                  visuallyHideLabel
                  containerClassName="text-left"
                  controlClassName="min-h-12 rounded-full"
                  className="h-12"
                  leadingContent={
                    <span aria-hidden="true">https://tippy.cash/</span>
                  }
                  name="username"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  aria-autocomplete="none"
                  spellCheck={false}
                  autoFocus
                  required
                  minLength={4}
                  maxLength={30}
                  placeholder="yourname"
                  value={username}
                  error={error}
                  trailingAction={
                    <Button
                      size="icon"
                      type={canContinue ? "submit" : "button"}
                      aria-label={
                        canContinue
                          ? "Continue with this username"
                          : "Close username field"
                      }
                      onClick={canContinue ? undefined : closeClaimFlow}>
                      <span
                        className="relative inline-flex size-4.5"
                        aria-hidden="true">
                        <span
                          className={cn(
                            "absolute inset-0 inline-flex transition-[opacity,scale,rotate] duration-160 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                            canContinue
                              ? "scale-100 rotate-0 opacity-100"
                              : "scale-65 -rotate-20 opacity-0",
                          )}>
                          <ArrowRightIcon className="size-4.5" />
                        </span>
                        <span
                          className={cn(
                            "absolute inset-0 inline-flex transition-[opacity,scale,rotate] duration-160 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                            canContinue
                              ? "scale-65 rotate-20 opacity-0"
                              : "scale-100 rotate-0 opacity-100",
                          )}>
                          <CloseIcon className="size-4.5" />
                        </span>
                      </span>
                    </Button>
                  }
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (error) setError("");
                  }}
                />
              </form>
            ) : (
              <div className="[view-transition-name:claim-control]">
                <Button onClick={openClaimFlow}>Claim your link</Button>
              </div>
            )}

            <div className="[view-transition-name:sample-link]">
              <ButtonLink variant="secondary" href="/abdul">
                See a sample page
              </ButtonLink>
            </div>
          </div>
          <div className="flex w-full flex-col items-center [view-transition-name:hero-rest]">
            <Secured text="Payments secured by" />
            <ProductPreview />
            <Features />
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

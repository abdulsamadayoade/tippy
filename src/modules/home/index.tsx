"use client";

import { useRef, useState, type SubmitEvent } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CloseIcon } from "@/components/icons/close";
import { Nav } from "@/components/layout/nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { ProductPreview } from "./components/product-preview";
import { Features } from "./components/features";
import { Secured } from "@/components/elements/secured";

export function Home() {
  const [claiming, setClaiming] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const canContinue = username.trim().length > 3;

  function closeClaimFlow() {
    setClaiming(false);
    setUsername("");
    setError("");
  }

  function submitUsername(event: SubmitEvent<HTMLFormElement>) {
    if (canContinue) return;

    event.preventDefault();
    setError("Choose a username with at least 4 characters.");
    inputRef.current?.focus();
  }

  const layoutTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.8 };

  return (
    <>
      <Nav />

      <main className="flex min-h-screen w-full max-w-full flex-col py-16">
        <section className="mx-auto flex w-full max-w-180 flex-1 flex-col items-center px-5 text-center">
          <h1 className="my-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance text-main-heading">
            Get tipped by the people who love your work.
          </h1>
          <p className="max-w-lg text-base font-medium leading-normal text-body-text/75 text-pretty">
            Tippy gives you one simple link to collect tips in naira — notes
            from your fans included, payouts straight to your bank. No more
            dropping your account number in the comments.
          </p>
          <LayoutGroup id="home-claim-flow">
            <motion.div
              layout
              className="mt-7 flex w-full flex-wrap items-start justify-center gap-2.5"
              transition={layoutTransition}>
              <AnimatePresence initial={false} mode="popLayout">
                {claiming ? (
                  <motion.form
                    key="username-form"
                    layoutId="claim-control"
                    className="w-88 max-w-full"
                    action="/login"
                    method="get"
                    autoComplete="off"
                    noValidate
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={layoutTransition}
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
                          <AnimatePresence initial={false} mode="wait">
                            <motion.span
                              key={canContinue ? "arrow" : "close"}
                              className="inline-flex"
                              initial={
                                reduceMotion
                                  ? false
                                  : { opacity: 0, scale: 0.65, rotate: -20 }
                              }
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              exit={
                                reduceMotion
                                  ? undefined
                                  : { opacity: 0, scale: 0.65, rotate: 20 }
                              }
                              transition={
                                reduceMotion
                                  ? { duration: 0 }
                                  : { duration: 0.16, ease: [0.16, 1, 0.3, 1] }
                              }>
                              {canContinue ? (
                                <ArrowRightIcon
                                  className="size-4.5"
                                  aria-hidden="true"
                                />
                              ) : (
                                <CloseIcon
                                  className="size-4.5"
                                  aria-hidden="true"
                                />
                              )}
                            </motion.span>
                          </AnimatePresence>
                        </Button>
                      }
                      onChange={(event) => {
                        setUsername(event.target.value);
                        if (error) setError("");
                      }}
                    />
                  </motion.form>
                ) : (
                  <motion.div
                    key="claim-button"
                    layoutId="claim-control"
                    exit={
                      reduceMotion ? undefined : { opacity: 0, scale: 0.96 }
                    }
                    transition={layoutTransition}>
                    <Button onClick={() => setClaiming(true)}>
                      Claim your link
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout="position" transition={layoutTransition}>
                <ButtonLink variant="secondary" href="/abdulsamad">
                  See a sample page
                </ButtonLink>
              </motion.div>
            </motion.div>
          </LayoutGroup>

          <Secured text="Payments secured by" />

          <ProductPreview />
          <Features />
        </section>
      </main>
    </>
  );
}

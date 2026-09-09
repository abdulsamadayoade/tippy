"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { SunIcon } from "../icons/sun";
import { MoonIcon } from "../icons/moon";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const ready = mounted && Boolean(resolvedTheme);
  const isDark = resolvedTheme === "dark";
  const label = ready
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Switch color theme";

  return (
    <Button
      variant="secondary"
      size="icon"
      className="size-6 min-h-6 active:scale-[0.96] motion-reduce:transform-none"
      aria-label={label}
      title={label}
      disabled={!ready}
      onClick={() => setTheme(isDark ? "light" : "dark")}>
      <span
        className="relative flex size-5 items-center justify-center"
        aria-hidden="true">
        {ready && (
          <AnimatePresence initial={false}>
            <motion.span
              key={isDark ? "sun" : "moon"}
              className="absolute inset-0 inline-flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", duration: 0.3, bounce: 0 }
              }>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </Button>
  );
}

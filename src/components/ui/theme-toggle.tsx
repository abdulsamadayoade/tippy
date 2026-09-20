"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "./button";
import { SunIcon } from "../icons/sun";
import { MoonIcon } from "../icons/moon";

const ICON =
  "absolute inset-0 inline-flex items-center justify-center transition-[opacity,scale,filter] duration-300 ease-(--ease-smooth) motion-reduce:transition-none";
const SHOWN = "scale-100 opacity-100 blur-[0px]";
const HIDDEN = "scale-25 opacity-0 blur-[4px]";

export function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const ready = mounted && Boolean(resolvedTheme);
  const isDark = resolvedTheme === "dark";
  const label = ready
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Switch color theme";

  return (
    <Button
      variant="secondary"
      size="icon"
      sound="toggle"
      className="size-6 min-h-6 active:scale-[0.96] motion-reduce:transform-none"
      aria-label={label}
      title={label}
      disabled={!ready}
      onClick={() => setTheme(isDark ? "light" : "dark")}>
      <span
        className="relative flex size-5 items-center justify-center"
        aria-hidden="true">
        {ready && (
          <>
            <span className={cn(ICON, isDark ? SHOWN : HIDDEN)}>
              <SunIcon />
            </span>
            <span className={cn(ICON, isDark ? HIDDEN : SHOWN)}>
              <MoonIcon />
            </span>
          </>
        )}
      </span>
    </Button>
  );
}

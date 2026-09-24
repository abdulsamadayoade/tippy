"use client";

import { useEffect, useRef, useState } from "react";

function readCloseDuration(fallbackDuration: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--dropdown-close-dur")
    .trim();
  const value = Number.parseFloat(raw);

  if (!Number.isFinite(value)) return fallbackDuration;
  return raw.endsWith("ms") ? value : raw.endsWith("s") ? value * 1000 : value;
}

export function useMenuState(fallbackCloseDuration = 150) {
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function beginClose() {
    setState((current) => (current === "open" ? "closing" : current));
  }

  function toggle() {
    setState((current) => (current === "open" ? "closing" : "open"));
  }

  useEffect(() => {
    if (state !== "closing") return;
    const id = window.setTimeout(
      () => setState("closed"),
      readCloseDuration(fallbackCloseDuration),
    );
    return () => window.clearTimeout(id);
  }, [state, fallbackCloseDuration]);

  useEffect(() => {
    if (state !== "open") return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) beginClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        beginClose();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [state]);

  return { state, toggle, beginClose, containerRef, triggerRef };
}

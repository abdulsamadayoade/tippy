"use client";

import { useCallback, useEffect, useState } from "react";

export type ModalPhase = "closed" | "opening" | "open" | "closing";

function readCloseDuration(propertyName: string, fallbackDuration: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(propertyName)
    .trim();
  const value = Number.parseFloat(raw);

  if (!Number.isFinite(value)) return fallbackDuration;
  return raw.endsWith("ms") ? value : raw.endsWith("s") ? value * 1000 : value;
}

export function useModalTransition(
  closeDurationProperty = "--modal-close-dur",
  fallbackCloseDuration = 150,
) {
  const [phase, setPhase] = useState<ModalPhase>("closed");

  useEffect(() => {
    if (phase !== "opening") return;

    let openFrame = 0;
    const paintFrame = window.requestAnimationFrame(() => {
      openFrame = window.requestAnimationFrame(() => setPhase("open"));
    });

    return () => {
      window.cancelAnimationFrame(paintFrame);
      window.cancelAnimationFrame(openFrame);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "closing") return;
    const timer = window.setTimeout(
      () => setPhase("closed"),
      readCloseDuration(closeDurationProperty, fallbackCloseDuration),
    );
    return () => window.clearTimeout(timer);
  }, [closeDurationProperty, fallbackCloseDuration, phase]);

  const open = useCallback(
    () =>
      setPhase((current) =>
        current === "closed" || current === "closing" ? "opening" : current,
      ),
    [],
  );

  const close = useCallback(
    () =>
      setPhase((current) =>
        current === "open" || current === "opening" ? "closing" : current,
      ),
    [],
  );

  const dismiss = useCallback(() => setPhase("closed"), []);

  return {
    phase,
    isMounted: phase !== "closed",
    isOpening: phase === "opening",
    isOpen: phase === "open",
    isClosing: phase === "closing",
    phaseClass:
      phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "",
    open,
    close,
    dismiss,
  };
}

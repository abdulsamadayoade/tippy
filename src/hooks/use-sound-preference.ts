"use client";

import { useSyncExternalStore } from "react";
import { play, setEnabled } from "cuelume";

const STORAGE_KEY = "tippy:sound";
const listeners = new Set<() => void>();

let memoryPreference: boolean | undefined;

function readPreference() {
  if (memoryPreference !== undefined) return memoryPreference;

  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function writePreference(enabled: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    memoryPreference = enabled;
  }

  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps other open tabs in step.
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const getServerSnapshot = () => true;

export function useSoundPreference() {
  const enabled = useSyncExternalStore(
    subscribe,
    readPreference,
    getServerSnapshot,
  );

  function toggle() {
    writePreference(!enabled);

    if (!enabled) {
      setEnabled(true);
      play("toggle");
    }
  }

  return { enabled, toggle };
}

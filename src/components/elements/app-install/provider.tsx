"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AppInstallContext } from "./context";
import type {
  AppInstallProviderProps,
  BeforeInstallPromptEvent,
} from "./types";

function subscribeToDisplayMode(onChange: () => void) {
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", onChange);
  return () => displayMode.removeEventListener("change", onChange);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true)
  );
}

function getServerSnapshot() {
  return false;
}

export function AppInstallProvider({ children }: AppInstallProviderProps) {
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [wasInstalled, setWasInstalled] = useState(false);
  const standalone = useSyncExternalStore(
    subscribeToDisplayMode,
    isStandalone,
    getServerSnapshot,
  );

  useEffect(() => {
    function handleInstallPrompt(event: Event) {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    }

    function handleInstalled() {
      promptRef.current = null;
      setCanInstall(false);
      setWasInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !window.isSecureContext ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error: unknown) => {
        console.error("Tippy offline support could not start", error);
      });
  }, []);

  async function install() {
    const prompt = promptRef.current;
    if (!prompt) return "unavailable" as const;

    promptRef.current = null;
    setCanInstall(false);
    const { outcome } = await prompt.prompt();
    return outcome;
  }

  return (
    <AppInstallContext.Provider
      value={{ canInstall, isInstalled: standalone || wasInstalled, install }}>
      {children}
    </AppInstallContext.Provider>
  );
}

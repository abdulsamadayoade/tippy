import type { ReactNode } from "react";

type InstallOutcome = "accepted" | "dismissed" | "unavailable";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
};

type AppInstallContextValue = {
  canInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<InstallOutcome>;
};

type AppInstallProviderProps = {
  children: ReactNode;
};

type AppInstallProps = {
  className?: string;
};

export type {
  BeforeInstallPromptEvent,
  AppInstallContextValue,
  AppInstallProviderProps,
  AppInstallProps,
};

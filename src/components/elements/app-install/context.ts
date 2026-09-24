"use client";

import { createContext } from "react";
import type { AppInstallContextValue } from "./types";

export const AppInstallContext = createContext<AppInstallContextValue | null>(
  null,
);

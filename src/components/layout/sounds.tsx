"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { bind, setEnabled, setVolume } from "cuelume";
import { useSoundPreference } from "@/hooks/use-sound-preference";

const VOLUME = 0.6;

export function Sounds() {
  const pathname = usePathname();
  const { enabled } = useSoundPreference();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    setVolume(VOLUME);
    bind();
  }, []);

  useEffect(() => {
    setEnabled(enabled && !isAdmin);
  }, [enabled, isAdmin]);

  return null;
}

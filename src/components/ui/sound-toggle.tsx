"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { useSoundPreference } from "@/hooks/use-sound-preference";
import { Button } from "./button";
import { VolumeIcon } from "../icons/volume";
import { VolumeOffIcon } from "../icons/volume-off";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const ICON =
  "absolute inset-0 inline-flex items-center justify-center transition-[opacity,scale,filter] duration-300 ease-(--ease-smooth) motion-reduce:transition-none";
const SHOWN = "scale-100 opacity-100 blur-[0px]";
const HIDDEN = "scale-25 opacity-0 blur-[4px]";

export function SoundToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { enabled, toggle } = useSoundPreference();
  const label = mounted
    ? `Turn sound effects ${enabled ? "off" : "on"}`
    : "Toggle sound effects";

  return (
    <Button
      variant="secondary"
      size="icon"
      sound="toggle"
      className="size-6 min-h-6 active:scale-[0.96] motion-reduce:transform-none"
      aria-label={label}
      title={label}
      disabled={!mounted}
      onClick={toggle}>
      <span
        className="relative flex size-5 items-center justify-center"
        aria-hidden="true">
        {mounted && (
          <>
            <span className={cn(ICON, enabled ? SHOWN : HIDDEN)}>
              <VolumeIcon />
            </span>
            <span className={cn(ICON, enabled ? HIDDEN : SHOWN)}>
              <VolumeOffIcon />
            </span>
          </>
        )}
      </span>
    </Button>
  );
}

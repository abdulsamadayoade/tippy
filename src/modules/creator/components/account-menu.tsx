"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useMenuState } from "@/hooks/use-menu-state";
import { useMounted } from "@/hooks/use-mounted";
import { useSoundPreference } from "@/hooks/use-sound-preference";
import { cn } from "@/lib/cn";
import { authClient } from "@/lib/auth-client";
import { CreatorAvatar } from "@/components/ui/creator-avatar";
import Link from "next/link";
import { LinkIcon } from "@/components/icons/link";
import { LogoutIcon } from "@/components/icons/logout";
import { MoonIcon } from "@/components/icons/moon";
import { SettingsIcon } from "@/components/icons/settings";
import { SunIcon } from "@/components/icons/sun";
import { VolumeIcon } from "@/components/icons/volume";
import { VolumeOffIcon } from "@/components/icons/volume-off";
import type { CreatorAccountMenuProps } from "../types";

const MENU_ITEM =
  "flex w-full text-menu-item-text hover:bg-menu-item-hover cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-ui-sm font-medium transition-colors duration-100 disabled:cursor-default disabled:opacity-60";

export function CreatorAccountMenu({
  displayName,
  username,
  tipUrl,
  avatarUrl,
}: CreatorAccountMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const { state, toggle, beginClose, containerRef, triggerRef } =
    useMenuState();
  const sound = useSoundPreference();
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const themeReady = mounted && Boolean(resolvedTheme);
  const isDark = themeReady && resolvedTheme === "dark";

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);

    const { error } = await authClient.signOut();
    if (error) {
      setSigningOut(false);
      beginClose();
      return;
    }

    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: `/${username}`, label: "View tip page", Icon: LinkIcon },
    { href: "/settings", label: "Settings", Icon: SettingsIcon },
  ];

  const toggles = [
    {
      label: "Dark mode",
      checked: isDark,
      disabled: !themeReady,
      status: themeReady ? (isDark ? "On" : "Off") : "",
      icon: isDark ? <MoonIcon /> : <SunIcon />,
      onClick: () => setTheme(isDark ? "light" : "dark"),
    },
    {
      label: "Sound effects",
      checked: sound.enabled,
      disabled: false,
      status: sound.enabled ? "On" : "Off",
      icon: sound.enabled ? (
        <VolumeIcon className="size-4" />
      ) : (
        <VolumeOffIcon className="size-4" />
      ),
      onClick: sound.toggle,
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        className="flex cursor-pointer items-center rounded-full transition-opacity duration-150 hover:opacity-90"
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={state === "open"}
        data-cuelume-toggle="tick"
        onClick={toggle}>
        <CreatorAvatar
          size="small"
          name={displayName}
          photoUrl={avatarUrl}
          loading="eager"
        />
      </button>

      <div
        role="menu"
        aria-label="Account"
        data-origin="top-right"
        inert={state === "closed"}
        className={cn(
          "t-dropdown absolute top-full shadow-menu right-0 z-30 mt-2 min-w-56 rounded-2xl bg-menu-bg p-1",
          state === "open" && "is-open",
          state === "closing" && "is-closing",
        )}>
        <div className="min-w-0 px-2.5 py-2">
          <p className="truncate text-sm font-medium text-main-heading">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted-text">{tipUrl}</p>
        </div>
        <div className="my-1 h-px bg-divider" />
        {links.map(({ href, label, Icon }) => (
          <Link
            className={MENU_ITEM}
            role="menuitem"
            href={href}
            key={href}
            data-cuelume-toggle="tick"
            onClick={beginClose}>
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
        {toggles.map(({ label, checked, disabled, status, icon, onClick }) => (
          <button
            className={MENU_ITEM}
            role="menuitemcheckbox"
            type="button"
            key={label}
            aria-checked={checked}
            disabled={disabled}
            data-cuelume-toggle=""
            onClick={onClick}>
            {icon}
            {label}
            <span className="ml-auto text-xs font-normal text-muted-text">
              {status}
            </span>
          </button>
        ))}
        <button
          className={MENU_ITEM}
          role="menuitem"
          type="button"
          disabled={signingOut}
          data-cuelume-toggle="tick"
          onClick={signOut}>
          <LogoutIcon className="size-4" />
          {signingOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    </div>
  );
}

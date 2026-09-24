"use client";

import Image from "next/image";
import { useContext, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CloseIcon } from "@/components/icons/close";
import { AppInstallContext } from "./context";
import type { AppInstallProps } from "./types";

export function AppInstall({ className }: AppInstallProps) {
  const appInstall = useContext(AppInstallContext);
  const headingId = useId();
  const descriptionId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState("");

  if (!appInstall || appInstall.isInstalled) return null;

  async function install() {
    if (!appInstall || isInstalling) return;
    setIsInstalling(true);
    setError("");

    try {
      const outcome = await appInstall.install();
      if (outcome === "accepted") setIsOpen(false);
    } catch {
      setError(
        "The install prompt couldn't open. Try the steps below instead.",
      );
    } finally {
      setIsInstalling(false);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className={className}
        aria-haspopup="dialog"
        onClick={() => {
          setError("");
          setIsOpen(true);
        }}>
        Install Tippy
      </Button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        labelledBy={headingId}
        describedBy={descriptionId}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl bg-card-bg p-6 text-left shadow-menu">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3"
          aria-label="Close installation instructions"
          onClick={() => setIsOpen(false)}>
          <CloseIcon className="size-5" aria-hidden="true" />
        </Button>
        <Image
          src="/icons/icon-192.png"
          width={56}
          height={56}
          alt=""
          className="rounded-2xl"
        />
        <h2
          id={headingId}
          className="mt-5 text-xl font-medium tracking-display text-main-heading">
          A little closer to your supporters.
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-sm leading-relaxed text-muted-text">
          Add Tippy to your home screen and open it like any other app.
        </p>

        {(appInstall.canInstall || isInstalling) && (
          <Button
            className="mt-5"
            fullWidth
            loading={isInstalling}
            loadingText="Opening install prompt…"
            onClick={install}>
            Install Tippy
          </Button>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 space-y-4 rounded-2xl bg-soft p-4 text-sm leading-relaxed text-muted-text">
          <div>
            <h3 className="font-medium text-main-heading">iPhone or iPad</h3>
            <p className="mt-1">
              Open Tippy in Safari, tap Share, then Add to Home Screen and Add.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-main-heading">Android</h3>
            <p className="mt-1">
              Open Tippy in Chrome. In the browser menu, tap Install app or Add
              to Home screen.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-main-heading">On your computer</h3>
            <p className="mt-1">
              Use the install icon in Chrome or Edge&apos;s address bar. In
              Safari, choose File, then Add to Dock.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-center text-muted-text">
          You&apos;ll still need an internet connection to view tips and make
          payments.
        </p>
      </Modal>
    </>
  );
}

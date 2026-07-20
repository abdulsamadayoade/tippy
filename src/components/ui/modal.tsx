"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useModalTransition } from "@/hooks/use-modal-transition";
import { cn } from "@/lib/cn";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ModalProps = {
  /** Desired visibility. The dialog stays mounted through its exit transition. */
  open: boolean;
  /** Requested when the user dismisses via Escape or the backdrop. */
  onClose: () => void;
  labelledBy?: string;
  describedBy?: string;
  /** "center" scales, "sheet" slides briefly, and "panel" uses the full reveal motion. */
  variant?: "center" | "sheet" | "panel";
  /** When false, Escape and backdrop clicks do not close (e.g. mid-request). */
  dismissible?: boolean;
  /** When false, focus is not returned to the opener on close. */
  restoreFocus?: boolean;
  /** Focused when the dialog opens; falls back to the dialog itself. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Classes for the dialog panel. */
  className?: string;
  /** Classes for the backdrop (e.g. a custom z-index). */
  overlayClassName?: string;
  children: ReactNode;
};

export function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  variant = "center",
  dismissible = true,
  restoreFocus = true,
  initialFocusRef,
  className,
  overlayClassName,
  children,
}: ModalProps) {
  const panelReveal = variant === "panel";
  const {
    isMounted,
    isOpen,
    isClosing,
    phaseClass,
    open: startOpen,
    close: startClose,
  } = useModalTransition(
    panelReveal ? "--panel-close-dur" : "--modal-close-dur",
    panelReveal ? 350 : 150,
  );
  const dialogRef = useRef<HTMLDivElement>(null);

  const dismissibleRef = useRef(dismissible);
  const restoreFocusRef = useRef(restoreFocus);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    dismissibleRef.current = dismissible;
    restoreFocusRef.current = restoreFocus;
    onCloseRef.current = onClose;
  }, [dismissible, onClose, restoreFocus]);

  useEffect(() => {
    if (open) startOpen();
    else startClose();
  }, [open, startOpen, startClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? dialogRef.current;
      target?.focus();
    });

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!dismissibleRef.current) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      const focusable =
        dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

      if (!dialog || !focusable?.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);

      if (restoreFocusRef.current && previouslyFocused?.isConnected) {
        window.requestAnimationFrame(() => previouslyFocused.focus());
      }
    };
  }, [isOpen, initialFocusRef]);

  if (!isMounted) return null;

  return (
    <div
      className={cn(
        "dialog-overlay fixed inset-0 z-50 flex bg-ink/40",
        variant === "sheet" || panelReveal
          ? "items-end justify-center overflow-hidden"
          : "items-center justify-center p-4",
        panelReveal && "dialog-overlay-panel",
        phaseClass,
        overlayClassName,
      )}
      role="presentation"
      inert={isClosing}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}>
      <div
        ref={dialogRef}
        className={cn(
          panelReveal ? "t-panel-slide" : "t-modal",
          variant === "sheet" && "t-modal-sheet",
          !panelReveal && phaseClass,
          className,
        )}
        data-open={panelReveal ? isOpen : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}

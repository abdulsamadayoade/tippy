"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useModalTransition } from "@/hooks/use-modal-transition";
import { cn } from "@/lib/cn";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  describedBy?: string;
  variant?: "center" | "panel";
  dismissible?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
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
    phase,
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
        "fixed inset-0 z-50 flex bg-ink/40 opacity-0 transition-opacity ease-(--ease-smooth) data-[state=open]:opacity-100 data-[state=closing]:pointer-events-none data-[state=open]:starting:opacity-0 motion-reduce:transition-none",
        panelReveal
          ? "items-end justify-center overflow-hidden duration-(--panel-close-dur) data-[state=open]:duration-400"
          : "items-center justify-center p-4 duration-(--modal-close-dur) data-[state=open]:duration-250",
        overlayClassName,
      )}
      data-state={phase}
      role="presentation"
      inert={isClosing}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}>
      <div
        ref={dialogRef}
        className={cn(
          "pointer-events-none opacity-0 ease-(--ease-smooth) data-[state=open]:pointer-events-auto data-[state=open]:opacity-100 data-[state=open]:starting:opacity-0 motion-reduce:transition-none",
          panelReveal
            ? "translate-y-[93.5px] blur-[2px] transition-[translate,opacity,filter] duration-(--panel-close-dur) will-change-[translate,opacity,filter] data-[state=open]:translate-y-0 data-[state=open]:blur-none data-[state=open]:duration-400 data-[state=open]:starting:translate-y-[93.5px] data-[state=open]:starting:blur-[2px]"
            : "origin-center scale-[0.96] transition-[scale,opacity] duration-250 will-change-[scale,opacity] data-[state=open]:scale-100 data-[state=closing]:duration-(--modal-close-dur) data-[state=open]:starting:scale-[0.96]",
          className,
        )}
        data-state={phase}
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

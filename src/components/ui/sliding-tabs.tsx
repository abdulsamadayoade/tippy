"use client";

import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

type TabOption<Value extends string> = {
  value: Value;
  label: string;
};

type SlidingTabsProps<Value extends string> = {
  idPrefix: string;
  label: string;
  options: readonly TabOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
};

function positionPill(
  pill: HTMLSpanElement,
  tab: HTMLButtonElement,
  animate: boolean,
) {
  if (!animate) {
    const previousTransition = pill.style.transition;
    pill.style.transition = "none";
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
    pill.style.width = `${tab.offsetWidth}px`;
    void pill.offsetWidth;
    pill.style.transition = previousTransition;
    return;
  }

  pill.style.transform = `translateX(${tab.offsetLeft}px)`;
  pill.style.width = `${tab.offsetWidth}px`;
}

export function SlidingTabs<Value extends string>({
  idPrefix,
  label,
  options,
  value,
  onChange,
  className = "",
}: SlidingTabsProps<Value>) {
  const barRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef(new Map<Value, HTMLButtonElement>());
  const hasMeasured = useRef(false);

  useLayoutEffect(() => {
    const pill = pillRef.current;
    const tab = tabRefs.current.get(value);
    if (!pill || !tab) return;

    positionPill(pill, tab, hasMeasured.current);
    hasMeasured.current = true;
  }, [value]);

  useEffect(() => {
    const snapPillToActiveTab = () => {
      const bar = barRef.current;
      const pill = pillRef.current;
      const tab = bar?.querySelector<HTMLButtonElement>(
        '[role="tab"][aria-selected="true"]',
      );
      if (pill && tab) positionPill(pill, tab, false);
    };

    window.addEventListener("resize", snapPillToActiveTab);

    return () => {
      window.removeEventListener("resize", snapPillToActiveTab);
    };
  }, []);

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex = index;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % options.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else return;

    event.preventDefault();
    const nextOption = options[nextIndex];
    onChange(nextOption.value);
    window.requestAnimationFrame(() =>
      tabRefs.current.get(nextOption.value)?.focus(),
    );
  }

  return (
    <div
      ref={barRef}
      className={cn(
        "relative inline-flex items-center gap-0.75 rounded-[48px] bg-(--color-6) p-0.75",
        className,
      )}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal">
      <span
        ref={pillRef}
        className="pointer-events-none absolute top-0.75 left-0 z-0 h-7.5 w-0 rounded-[48px] bg-white transition-[transform,width] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,width] motion-reduce:transition-none"
        aria-hidden="true"
      />
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <button
            ref={(element) => {
              if (element) tabRefs.current.set(option.value, element);
              else tabRefs.current.delete(option.value);
            }}
            id={`${idPrefix}-${option.value}-tab`}
            className="relative z-1 h-7.5 cursor-pointer appearance-none rounded-[48px] bg-transparent px-3 py-1 text-body-text/80 transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-main-heading aria-selected:text-main-heading motion-reduce:transition-none"
            key={option.value}
            type="button"
            role="tab"
            aria-controls={`${idPrefix}-${option.value}-panel`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

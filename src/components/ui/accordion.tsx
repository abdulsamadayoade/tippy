"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@/components/icons/chevron-down";

type AccordionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Accordion({ title, children, className }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;

  return (
    <div
      className={cn(
        "hover:bg-soft transition-colors duration-150 rounded-[1.25rem] motion-reduce:transition-none",
        className,
      )}>
      <h3>
        <button
          id={triggerId}
          type="button"
          className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-4 rounded-[1.25rem] px-5 py-4 text-left text-sm font-medium text-main-heading focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary dark:focus-visible:outline-white"
          aria-expanded={isOpen}
          aria-controls={panelId}
          data-cuelume-toggle="tick"
          onClick={() => setIsOpen((current) => !current)}>
          <span>{title}</span>
          <span
            className={cn(
              "inline-flex origin-center shrink-0 text-muted-text transition-transform duration-250 ease-(--ease-smooth) motion-reduce:transition-none",
              isOpen && "-scale-y-100",
            )}
            aria-hidden="true">
            <ChevronDownIcon className="size-4 [&_path]:[vector-effect:non-scaling-stroke]" />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-250 ease-(--ease-smooth) motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
        inert={!isOpen}>
        <div
          className={cn(
            "min-h-0 overflow-hidden transition-[opacity,filter] duration-250 ease-(--ease-smooth) motion-reduce:transition-none",
            isOpen ? "opacity-100 blur-none" : "opacity-0 blur-[2px]",
          )}>
          <div className="px-5 pb-4 text-sm leading-relaxed text-body-text">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

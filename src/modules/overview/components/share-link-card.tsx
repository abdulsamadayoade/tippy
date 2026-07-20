"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons/check";
import { CopyIcon } from "@/components/icons/copy";

export function ShareLinkCard({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

  async function copyTipLink() {
    const link = `${window.location.origin}/${username}`;

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }

    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  useEffect(() => {
    return () => window.clearTimeout(copyTimer.current);
  }, []);

  return (
    <article className="mt-3 flex flex-wrap items-center justify-between gap-3.5 rounded-surface bg-white px-4.5 py-4 shadow-surface">
      <div>
        <span className="block text-ui-sm text-muted-text">
          Share your tip link
        </span>
        <strong className="mt-0.75 block text-base font-medium text-main-heading">
          {`tippy.cash/${username}`}
        </strong>
      </div>
      <button
        className="major-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-2.5 py-1 text-ui-sm font-medium text-white transition-[background-color,transform] duration-150 active:scale-[0.985]"
        type="button"
        onClick={copyTipLink}>
        {copied ? (
          <CheckIcon className="size-3.5 stroke-2" />
        ) : (
          <CopyIcon className="size-3.5 stroke-2" />
        )}
        {copied ? "Link copied" : "Copy link"}
      </button>
    </article>
  );
}

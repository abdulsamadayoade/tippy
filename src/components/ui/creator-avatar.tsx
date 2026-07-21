"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

type AvatarSize = "small" | "medium" | "large";

const SIZE_IN_PIXELS: Record<AvatarSize, number> = {
  small: 32,
  medium: 44,
  large: 64,
};

export function CreatorAvatar({
  name,
  photoUrl,
  size = "large",
  loading = "lazy",
}: {
  name: string;
  photoUrl?: string | null;
  size?: AvatarSize;
  loading?: "eager" | "lazy";
}) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const pixels = SIZE_IN_PIXELS[size];
  const initial = name.trim().charAt(0).toUpperCase();
  const src = photoUrl?.trim() ? photoUrl : null;
  const showImage = src !== null && src !== failedUrl;
  const imageLoaded = showImage && src === loadedUrl;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-main-heading font-medium text-white",
        size === "large" && "size-16 text-2xl",
        size === "medium" && "size-11 text-lg",
        size === "small" && "size-8 text-sm",
      )}>
      <span
        className={cn(
          "transition-opacity duration-150",
          imageLoaded ? "opacity-0" : "opacity-100",
        )}
        role={showImage ? undefined : "img"}
        aria-label={showImage ? undefined : name}
        aria-hidden={showImage ? true : undefined}>
        {initial}
      </span>

      {showImage ? (
        <Image
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-150",
            imageLoaded ? "opacity-100" : "opacity-0",
          )}
          src={src}
          alt={name}
          width={pixels}
          height={pixels}
          sizes={`${pixels}px`}
          loading={loading}
          preload={loading === "eager"}
          onLoad={() => setLoadedUrl(src)}
          onError={() => setFailedUrl(src)}
        />
      ) : null}
    </span>
  );
}

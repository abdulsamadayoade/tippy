"use client";

import Image from "next/image";
import { useState } from "react";
import { Blobatar } from "@blobatar/react";
import { cn } from "@/lib/cn";

type AvatarSize = "small" | "medium" | "large";

const SIZE_IN_PIXELS: Record<AvatarSize, number> = {
  small: 32,
  medium: 44,
  large: 64,
};

export function CreatorAvatar({
  name,
  seed,
  photoUrl,
  size = "large",
  loading = "lazy",
}: {
  name: string;
  seed?: string;
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
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium text-white",
        showImage ? "bg-main-heading" : "bg-soft",
        size === "large" && "size-16 text-2xl",
        size === "medium" && "size-11 text-lg",
        size === "small" && "size-8 text-sm",
      )}>
      {showImage ? (
        <span
          className={cn(
            "transition-opacity duration-150",
            imageLoaded ? "opacity-0" : "opacity-100",
          )}
          aria-hidden="true">
          {initial}
        </span>
      ) : (
        <Blobatar className="size-full" name={seed ?? name} alt={name} />
      )}

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

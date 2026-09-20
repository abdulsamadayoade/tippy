import Link from "next/link";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "major-button bg-primary",
  secondary: "bg-soft text-ink hover:bg-line",
  ghost: "bg-transparent text-muted-text-2 disabled:opacity-45",
} as const;

const sizes = {
  default: "min-h-12 px-6",
  sm: "min-h-10 px-4",
  xs: "h-6 px-3",
  icon: "size-9 min-h-9 p-0",
} as const;

const sounds = {
  press: { "data-cuelume-press": "", "data-cuelume-release": "" },
  toggle: { "data-cuelume-toggle": "" },
  none: {},
} as const;

type ButtonStyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
  className?: string;
  sound?: keyof typeof sounds;
};

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  ButtonStyleProps & {
    loading?: boolean;
    loadingText?: ReactNode;
  };

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> &
  ButtonStyleProps & {
    children: ReactNode;
  };

export function buttonClassName({
  variant = "primary",
  size = "default",
  fullWidth = false,
  className,
}: ButtonStyleProps = {}) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-[background-color,box-shadow,color,opacity,transform] duration-150 ease-out active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      fullWidth,
      className,
      type = "button",
      loading = false,
      loadingText,
      disabled,
      sound = "press",
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      {...sounds[sound]}
      className={buttonClassName({
        variant,
        size,
        fullWidth,
        className,
      })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}>
      {loading ? (
        <>
          <span
            className="size-3.75 animate-spin rounded-full border-2 border-current/35 border-t-current"
            aria-hidden="true"
          />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  ),
);

Button.displayName = "Button";

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      variant = "primary",
      size = "default",
      fullWidth,
      className,
      sound = "press",
      ...props
    },
    ref,
  ) => (
    <Link
      ref={ref}
      {...sounds[sound]}
      className={buttonClassName({
        variant,
        size,
        fullWidth,
        className,
      })}
      {...props}
    />
  ),
);

ButtonLink.displayName = "ButtonLink";

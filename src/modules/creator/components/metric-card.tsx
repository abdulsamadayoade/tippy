import { cn } from "@/lib/cn";

export function MetricCard({
  className,
  label,
  value,
  hint,
}: {
  className?: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-surface bg-white p-4.5 shadow-surface",
        className,
      )}>
      <span className="block text-ui-sm text-muted-text">{label}</span>
      <strong className="mt-2 block text-2xl font-medium text-main-heading">
        {value}
      </strong>
      {hint && (
        <small className="mt-1.5 block text-xs text-muted-text">{hint}</small>
      )}
    </article>
  );
}

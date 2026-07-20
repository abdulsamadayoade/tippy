import { cn } from "@/lib/cn";

export function MetricCard({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <article
      className={cn("rounded-[14px] bg-white p-4.5 shadow-surface", className)}>
      <span className="block text-ui-sm text-muted-text">{label}</span>
      <strong className="mt-2 block text-2xl font-medium text-main-heading">
        {value}
      </strong>
    </article>
  );
}

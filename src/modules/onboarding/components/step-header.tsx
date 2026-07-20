import { cn } from "@/lib/cn";

export function StepHeader({
  step,
  title,
  sub,
}: {
  step: 1 | 2;
  title: string;
  sub: string;
}) {
  return (
    <header>
      <div className="flex gap-4" aria-hidden="true">
        <span className="h-1.5 flex-1 rounded-full bg-primary" />
        <span
          className={cn(
            "h-1.5 flex-1 rounded-full",
            step === 2 ? "bg-primary" : "bg-line",
          )}
        />
      </div>
      <p className="mt-7 text-xs font-medium tracking-widest text-muted-text uppercase">
        Step {step} of 2
      </p>
      <h1 className="mt-2 mb-1 text-xl font-semibold tracking-tight text-main-heading">
        {title}
      </h1>
      <p className="max-w-sm text-muted-text text-pretty">{sub}</p>
    </header>
  );
}

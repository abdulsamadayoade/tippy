import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/cn";
import { NUMBER_FLOW_OPACITY_TIMING, NUMBER_FLOW_TIMING } from "../data";

export function AnimatedNaira({
  className,
  value,
}: {
  className?: string;
  value: number;
}) {
  return (
    <NumberFlow
      className={cn("leading-none tabular-nums", className)}
      format={{ maximumFractionDigits: 0 }}
      locales="en-NG"
      opacityTiming={NUMBER_FLOW_OPACITY_TIMING}
      prefix="₦"
      spinTiming={NUMBER_FLOW_TIMING}
      transformTiming={NUMBER_FLOW_TIMING}
      value={value}
      willChange
    />
  );
}

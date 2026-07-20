import type { TipFilter } from "./types";

function isTipFilter(value: string | null): value is TipFilter {
  return value === "all" || value === "notes" || value === "anonymous";
}

export { isTipFilter };

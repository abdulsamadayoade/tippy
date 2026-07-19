import { twMerge } from "tailwind-merge";

type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return twMerge(classes.filter((className): className is string => Boolean(className)).join(" "));
}

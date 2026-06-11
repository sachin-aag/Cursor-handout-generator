import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-md border border-cursor-border-emphasis bg-cursor-surface px-3 py-2 text-sm text-cursor-text placeholder:text-cursor-text-faint focus:border-cursor-orange/50 focus:outline-none focus:ring-1 focus:ring-cursor-orange/30";

export const fileInputClass = cn(
  inputClass,
  "cursor-pointer py-1.5 file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-cursor-text hover:file:bg-white/15"
);

export function fieldClass(className?: string) {
  return cn("space-y-1.5", className);
}

import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-12 w-full rounded-xl border border-border/85 bg-white/95 px-4 py-3 text-sm shadow-sm outline-none transition-[border-color,box-shadow,background-color] focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-primary/10",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

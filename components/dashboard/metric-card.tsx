import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  tone = "default",
  icon
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "warning";
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm sm:p-5",
        tone === "success" && "border-success/20 bg-success/5",
        tone === "warning" && "border-warning/25 bg-warning/10",
        tone === "default" && "border-border/80 bg-white/82"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 break-words text-[1.65rem] font-semibold tracking-tight sm:text-3xl">{value}</p>
        </div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

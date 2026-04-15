import { cn } from "@/lib/utils";

export function UpmatchLogo({
  compact = false,
  className,
  theme = "light"
}: {
  compact?: boolean;
  className?: string;
  theme?: "light" | "dark";
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm",
          theme === "dark"
            ? "border border-white/10 bg-white/[0.08] text-white"
            : "border border-primary/20 bg-primary text-primary-foreground"
        )}
      >
        <div className="grid h-4 w-4 grid-cols-2 gap-1">
          <span className={cn("rounded-full", theme === "dark" ? "bg-white/95" : "bg-primary-foreground/95")} />
          <span className={cn("rounded-full", theme === "dark" ? "bg-white/65" : "bg-primary-foreground/70")} />
          <span className={cn("rounded-full", theme === "dark" ? "bg-white/65" : "bg-primary-foreground/70")} />
          <span className={cn("rounded-full", theme === "dark" ? "bg-white/95" : "bg-primary-foreground/95")} />
        </div>
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-base font-semibold tracking-tight",
            theme === "dark" ? "text-white" : "text-foreground"
          )}
        >
          Upmatch
        </p>
        {compact ? null : (
          <p className={cn("text-xs", theme === "dark" ? "text-white/45" : "text-muted-foreground")}>
            Freelancer job intelligence
          </p>
        )}
      </div>
    </div>
  );
}

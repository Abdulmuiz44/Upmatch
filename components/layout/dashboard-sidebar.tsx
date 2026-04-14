import type { Route } from "next";
import Link from "next/link";
import { BarChart3, BriefcaseBusiness, PanelsTopLeft, Settings2, ShieldCheck } from "lucide-react";

import { UpmatchLogo } from "@/components/brand/upmatch-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string; icon: typeof PanelsTopLeft }> = [
  { href: "/dashboard", label: "Overview", icon: PanelsTopLeft },
  { href: "/dashboard/onboarding", label: "Preferences", icon: BriefcaseBusiness },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 }
];

export function DashboardSidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="flex w-full flex-col rounded-2xl border border-border/75 bg-white/86 p-4 shadow-panel lg:min-h-[calc(100vh-6rem)] lg:p-5">
      <div className="space-y-4 border-b border-border/70 pb-5">
        <UpmatchLogo compact />
        <div>
          <Badge className="mb-3">Workspace</Badge>
          <p className="text-lg font-semibold">Freelancer cockpit</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            One calm workspace for connection status, ranking inputs, and job review.
          </p>
        </div>
      </div>
      <nav className="mt-5 grid grid-flow-col auto-cols-[minmax(9.5rem,1fr)] gap-2 overflow-x-auto pb-1 sm:auto-cols-[minmax(10.5rem,1fr)] lg:grid-flow-row lg:auto-cols-auto lg:overflow-visible lg:pb-0">
        {navItems.map((item) => {
          const active = currentPath === item.href;
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "border border-primary/10 bg-primary text-primary-foreground shadow-sm"
                  : "border border-transparent text-muted-foreground hover:border-border/80 hover:bg-secondary/70 hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-5 rounded-2xl border border-border/70 bg-secondary/75 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Compliance-first workflow</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Upmatch helps you evaluate jobs and draft smarter responses. Final application stays on
          Upwork.
        </p>
      </div>
      <div className="mt-auto hidden rounded-2xl border border-border/70 bg-white/75 p-4 lg:block">
        <div className="flex items-center gap-2 text-primary">
          <BarChart3 className="h-4 w-4" />
          <p className="text-sm font-semibold">Operating view</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review ranked jobs, connection state, and preference quality without noise.
        </p>
      </div>
    </aside>
  );
}

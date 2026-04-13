import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/onboarding", label: "Onboarding" },
  { href: "/dashboard/settings", label: "Settings" }
];

export function DashboardSidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="flex h-full min-h-[calc(100vh-3rem)] w-full flex-col rounded-[28px] border bg-white/90 p-6 shadow-soft lg:max-w-xs">
      <div className="space-y-3">
        <Badge>Upmatch Workspace</Badge>
        <div>
          <p className="text-xl font-semibold">Freelancer cockpit</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Preferences, connection status, and matched jobs live here.
          </p>
        </div>
      </div>
      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const active = currentPath === item.href;

          return (
            <Link
              className={cn(
                "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-secondary p-4">
        <p className="text-sm font-medium">Compliance guardrail</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Upmatch supports discovery and proposal guidance only. Final application
          remains on Upwork.
        </p>
      </div>
    </aside>
  );
}

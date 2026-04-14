import { BellDot, CircleDot, RefreshCw } from "lucide-react";

import type { User } from "@/lib/db/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardTopbar({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/75 bg-white/82 p-4 shadow-panel sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
          <BellDot className="h-5 w-5" />
        </div>
        <div>
          <Badge className="mb-2">Protected workspace</Badge>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Welcome back{user.fullName ? `, ${user.fullName}` : ""}.
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Stay close to connection status, ranked opportunities, and proposal preparation.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="app-surface-muted flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <CircleDot className="h-3.5 w-3.5 text-success" />
          Secure session active
        </div>
        <div className="app-surface-muted hidden items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:flex">
          <RefreshCw className="h-3.5 w-3.5 text-primary" />
          Ready to sync
        </div>
        <form action="/api/auth/logout" method="post" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto" variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}

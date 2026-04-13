import type { User } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardTopbar({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border bg-white/90 p-6 shadow-soft md:flex-row md:items-center md:justify-between">
      <div>
        <Badge>Protected workspace</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Welcome back{user.fullName ? `, ${user.fullName}` : ""}.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          This dashboard is shaped for connection status, job refresh workflows,
          explainable matches, and proposal support.
        </p>
      </div>
      <form action="/api/auth/logout" method="post">
        <Button variant="outline" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}

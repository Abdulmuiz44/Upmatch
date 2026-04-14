import Link from "next/link";
import { CircleDot, Settings2, ShieldCheck, UserCircle2 } from "lucide-react";

import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import { cn } from "@/lib/utils";
import { getUserPreferences } from "@/server/services/preferences-service";
import { getUpworkConnectionStatus } from "@/server/services/upwork-connection-service";

export default async function SettingsPage() {
  const user = await requireUser();
  const [preference, connection] = await Promise.all([
    getUserPreferences(user.id),
    getUpworkConnectionStatus(user.id)
  ]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Settings"
        title="Keep your account, connection, and targeting rules trustworthy."
        description="Review the product account identity, Upwork connection status, and the preferences shaping your ranking behavior."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Upwork connection</CardTitle>
                <CardDescription>
                  OAuth configuration and token persistence remain server-only.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-border/75 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Current status</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {connection ? connection.status : "No account connected"}
                </p>
              </div>
              <Badge>{connection?.tenantId ? "Tenant set" : "Tenant pending"}</Badge>
            </div>
            <div className="rounded-2xl border border-border/75 bg-secondary/65 p-4 text-sm leading-6 text-muted-foreground">
              Connect when you are ready to sync profile information and ingest new jobs. Upmatch
              does not automate final applications.
            </div>
            <a className={cn(buttonVariants({ size: "default" }))} href="/api/upwork/connect">
              Connect or reconnect Upwork
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Product account</CardTitle>
                <CardDescription>
                  Lightweight identity layer for a protected dashboard.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Email
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Name
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{user.fullName ?? "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-border/75 bg-secondary/65 p-4 leading-6">
              This account anchors your protected workspace while leaving room for future auth
              provider changes if needed.
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Preference snapshot</CardTitle>
                <CardDescription>
                  Edit targeting rules through onboarding until a dedicated settings editor lands.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/75 bg-secondary/65 p-4 text-sm text-muted-foreground">
              Roles: {preference?.preferredRoles.join(", ") || "Not configured"}
            </div>
            <div className="rounded-2xl border border-border/75 bg-secondary/65 p-4 text-sm text-muted-foreground">
              Industries: {preference?.preferredIndustries.join(", ") || "Not configured"}
            </div>
            <div className="rounded-2xl border border-border/75 bg-secondary/65 p-4 text-sm text-muted-foreground">
              Keywords: {preference?.preferredKeywords.join(", ") || "Not configured"}
            </div>
            <div className="rounded-2xl border border-border/75 bg-secondary/65 p-4 text-sm text-muted-foreground">
              Exclusions: {preference?.excludedKeywords.join(", ") || "Not configured"}
            </div>
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4 md:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CircleDot className="h-4 w-4 text-primary" />
                  Keep preferences concise so ranking remains selective.
                </div>
                <Link
                  className={cn(buttonVariants({ variant: "outline", size: "default" }))}
                  href="/dashboard/onboarding"
                >
                  Edit preferences
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

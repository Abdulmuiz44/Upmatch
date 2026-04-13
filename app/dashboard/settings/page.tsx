import Link from "next/link";

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
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Upwork connection</CardTitle>
          <CardDescription>
            OAuth configuration and token persistence remain server-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="text-sm font-medium">Current status</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {connection ? connection.status : "No account connected"}
              </p>
            </div>
            <Badge>{connection?.tenantId ? "Tenant set" : "Tenant pending"}</Badge>
          </div>
          <a className={cn(buttonVariants({ size: "default" }))} href="/api/upwork/connect">
            Connect or reconnect Upwork
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product account</CardTitle>
          <CardDescription>
            Lightweight product identity now, provider swap later if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Email: {user.email}</p>
          <p>Name: {user.fullName ?? "Not set"}</p>
          <p>Created account for a protected dashboard and future sync workflows.</p>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Preference snapshot</CardTitle>
          <CardDescription>
            Edit targeting rules through onboarding until a dedicated settings editor
            lands.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
            Roles: {preference?.preferredRoles.join(", ") || "Not configured"}
          </div>
          <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
            Industries: {preference?.preferredIndustries.join(", ") || "Not configured"}
          </div>
          <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
            Keywords: {preference?.preferredKeywords.join(", ") || "Not configured"}
          </div>
          <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
            Exclusions: {preference?.excludedKeywords.join(", ") || "Not configured"}
          </div>
          <Link
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
            href="/dashboard/onboarding"
          >
            Edit onboarding preferences
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

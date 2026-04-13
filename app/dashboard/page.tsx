import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import { formatCurrency, cn } from "@/lib/utils";
import { getDashboardSnapshot } from "@/server/services/dashboard-service";

export default async function DashboardPage() {
  const user = await requireUser();
  const snapshot = await getDashboardSnapshot(user.id);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upwork connection status</CardTitle>
            <CardDescription>
              Start from the official OAuth flow and keep all tokens server-side.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-2xl bg-secondary p-4">
              <div>
                <p className="text-sm font-medium">Connection</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {snapshot.connection
                    ? `Status: ${snapshot.connection.status}`
                    : "No Upwork account connected yet."}
                </p>
              </div>
              <Badge>{snapshot.connection ? "Configured" : "Pending"}</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <a className={cn(buttonVariants({ size: "default" }))} href="/api/upwork/connect">
                Connect Upwork
              </a>
              <Link
                className={cn(buttonVariants({ variant: "outline", size: "default" }))}
                href="/dashboard/settings"
              >
                Open settings
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preference summary</CardTitle>
            <CardDescription>
              The foundation is ready for deterministic matching inputs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-medium">Preferred roles</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {snapshot.preference?.preferredRoles.join(", ") || "Not set yet"}
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-medium">Minimum hourly rate</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {snapshot.preference?.minimumHourlyRateUsd
                  ? formatCurrency(Number(snapshot.preference.minimumHourlyRateUsd))
                  : "Not set yet"}
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-medium">Excluded keywords</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {snapshot.preference?.excludedKeywords.join(", ") || "No exclusions configured"}
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-medium">Contract type</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {snapshot.preference?.contractType ?? "BOTH"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Matched jobs placeholder</CardTitle>
            <CardDescription>
              These records will be replaced by real normalized Upwork job data in the
              next slice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.jobs.map((job) => (
              <div
                className="flex flex-col gap-4 rounded-2xl border p-5 md:flex-row md:items-start md:justify-between"
                key={job.id}
              >
                <div>
                  <p className="text-base font-semibold">{job.title}</p>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {job.summary}
                  </p>
                  <p className="mt-3 text-sm text-foreground">{job.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>Score {job.score}</Badge>
                  <Link
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    href={`/dashboard/jobs/${job.id}`}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refresh status</CardTitle>
            <CardDescription>
              Rate-limit-safe refresh workflows belong on the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
              The refresh endpoint exists as a protected scaffold. Job search,
              normalization, retention, and ranking are intentionally deferred to the
              next implementation slice.
            </div>
            <form action="/api/jobs/refresh" method="post">
              <Button type="submit">Run placeholder refresh</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

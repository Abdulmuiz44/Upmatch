import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import { formatCurrency, cn } from "@/lib/utils";
import { getDashboardSnapshot } from "@/server/services/dashboard-service";

function renderRefreshMessage(refresh?: string) {
  if (refresh === "queued") return "Refresh queued. Results will appear shortly.";
  if (refresh === "success") return "Refresh completed successfully.";
  if (refresh === "missing_connection") return "Connect Upwork before refreshing.";
  return null;
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const snapshot = await getDashboardSnapshot(user.id);
  const params = (await searchParams) ?? {};
  const refreshStatus = Array.isArray(params.refresh) ? params.refresh[0] : params.refresh;
  const cleanupStatus = Array.isArray(params.cleanup) ? params.cleanup[0] : params.cleanup;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upwork connection status</CardTitle>
            <CardDescription>OAuth and GraphQL integration is fully server-side.</CardDescription>
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
            <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
              Sync status: {snapshot.syncStatus?.status ?? "IDLE"}
              {snapshot.syncStatus?.completedAt && (
                <span> · Last run {new Date(snapshot.syncStatus.completedAt).toLocaleString()}</span>
              )}
              {snapshot.syncStatus?.status === "FAILED" && snapshot.syncStatus.errorMessage && (
                <p className="mt-1 text-amber-700">Last failure: {snapshot.syncStatus.errorMessage}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <a className={cn(buttonVariants({ size: "default" }))} href="/api/upwork/connect">
                Connect Upwork
              </a>
              <Link className={cn(buttonVariants({ variant: "outline", size: "default" }))} href="/dashboard/settings">
                Open settings
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preference summary</CardTitle>
            <CardDescription>Ranking uses your saved role, keyword, and budget signals.</CardDescription>
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
              <p className="mt-2 text-sm text-muted-foreground">{snapshot.preference?.contractType ?? "BOTH"}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ranked job matches</CardTitle>
            <CardDescription>Deterministic scoring with transparent reasons and warnings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.emptyStates.noConnection && (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Connect your Upwork account to ingest jobs.</div>
            )}
            {snapshot.emptyStates.noPreferences && (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Save preferences in onboarding/settings to activate matching.</div>
            )}
            {snapshot.emptyStates.noSyncedProfile && !snapshot.emptyStates.noConnection && (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">Profile has not been synced yet. Run refresh to pull latest profile data.</div>
            )}
            {snapshot.emptyStates.noJobsFound && !snapshot.emptyStates.noConnection && !snapshot.emptyStates.noPreferences && (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No jobs found yet. Try updating keywords or run refresh later.</div>
            )}
            {snapshot.jobs.map((job) => (
              <div className="flex flex-col gap-4 rounded-2xl border p-5 md:flex-row md:items-start md:justify-between" key={job.id}>
                <div>
                  <p className="text-base font-semibold">{job.title}</p>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{job.summary || "No description available."}</p>
                  <p className="mt-3 text-sm text-foreground">{job.explanation.topReasons?.[0] ?? "Scored using your current profile and preferences."}</p>
                  {job.explanation.warnings?.[0] && (
                    <p className="mt-1 text-xs text-amber-700">Warning ({job.explanation.warningLevel ?? "low"}): {job.explanation.warnings[0]}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge>Score {job.overallScore}</Badge>
                  <Badge className="bg-transparent border border-border text-foreground">{job.state}</Badge>
                  <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }))} href={`/dashboard/jobs/${job.id}`}>
                    View
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refresh pipeline</CardTitle>
            <CardDescription>Queue-backed sync with inline fallback for operational safety.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderRefreshMessage(refreshStatus) && (
              <div className="rounded-2xl border p-3 text-sm text-muted-foreground">{renderRefreshMessage(refreshStatus)}</div>
            )}
            {cleanupStatus === "success" && (
              <div className="rounded-2xl border p-3 text-sm text-muted-foreground">Expired cache cleanup completed.</div>
            )}
            {cleanupStatus === "error" && (
              <div className="rounded-2xl border p-3 text-sm text-amber-700">Cleanup failed. Try again.</div>
            )}
            <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
              Manual refresh is rate-limited and queued to avoid aggressive provider calls.
            </div>
            <form action="/api/jobs/refresh" method="post">
              <Button type="submit">Refresh jobs now</Button>
            </form>
            <form action="/api/jobs/cleanup" method="post">
              <Button variant="outline" type="submit">Cleanup expired cache</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

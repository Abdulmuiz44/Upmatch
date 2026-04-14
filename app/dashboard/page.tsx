import Link from "next/link";
import {
  Activity,
  BriefcaseBusiness,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Star
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import { cn, formatCurrency } from "@/lib/utils";
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
  const savedJobs = snapshot.jobs.filter((job) => job.state === "SAVED").length;
  const connected = Boolean(snapshot.connection);
  const syncLabel = snapshot.syncStatus?.completedAt
    ? new Date(snapshot.syncStatus.completedAt).toLocaleDateString()
    : "Awaiting first sync";

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Overview"
        title="Operational view for your Upwork job pipeline."
        description="Track connection state, refresh activity, and ranked opportunities in one calm workspace built for scanability."
        actions={
          <>
            <form action="/api/jobs/refresh" method="post">
              <Button type="submit">Refresh jobs</Button>
            </form>
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              href="/dashboard/settings"
            >
              Review settings
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Matched jobs"
          value={String(snapshot.jobs.length)}
          detail="Live opportunities currently visible in your ranked feed."
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        />
        <MetricCard
          label="Saved jobs"
          value={String(savedJobs)}
          detail="Shortlisted opportunities kept for deeper review."
          icon={<Star className="h-5 w-5" />}
        />
        <MetricCard
          label="Connection"
          value={connected ? "Active" : "Pending"}
          detail={
            connected
              ? `Upwork status: ${snapshot.connection?.status ?? "ACTIVE"}`
              : "Connect Upwork to unlock profile sync and ingestion."
          }
          tone={connected ? "success" : "warning"}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <MetricCard
          label="Last sync"
          value={syncLabel}
          detail={snapshot.syncStatus?.status ?? "IDLE"}
          icon={<Activity className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Connection and sync status</CardTitle>
            <CardDescription>
              See whether Upwork is connected and whether your latest sync completed cleanly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border/75 bg-secondary/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">Upwork connection</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {snapshot.connection
                      ? `Connected with status ${snapshot.connection.status}.`
                      : "No Upwork account connected yet."}
                  </p>
                </div>
                <Badge>{snapshot.connection ? "Connected" : "Pending"}</Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4 text-sm">
              <p className="text-sm font-semibold">Latest pipeline state</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {snapshot.syncStatus?.status ?? "IDLE"}
                {snapshot.syncStatus?.completedAt ? (
                  <>
                    {" "}
                    · Last completed {new Date(snapshot.syncStatus.completedAt).toLocaleString()}
                  </>
                ) : null}
              </p>
              {snapshot.syncStatus?.status === "FAILED" && snapshot.syncStatus.errorMessage ? (
                <p className="mt-2 text-sm text-amber-700">
                  Last failure: {snapshot.syncStatus.errorMessage}
                </p>
              ) : null}
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
              Your ranking model is shaped by these saved inputs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4">
              <p className="text-sm font-medium">Preferred roles</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {snapshot.preference?.preferredRoles.join(", ") || "Not set yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4">
              <p className="text-sm font-medium">Minimum hourly rate</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {snapshot.preference?.minimumHourlyRateUsd
                  ? formatCurrency(snapshot.preference.minimumHourlyRateUsd)
                  : "Not set yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4">
              <p className="text-sm font-medium">Excluded keywords</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {snapshot.preference?.excludedKeywords.join(", ") || "No exclusions configured"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4">
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
            <CardTitle>Ranked job matches</CardTitle>
            <CardDescription>
              Review the best-fit opportunities first, with reasons and risk notes visible at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.emptyStates.noConnection ? (
              <div className="rounded-2xl border border-border/75 bg-secondary/70 p-4 text-sm text-muted-foreground">
                Connect your Upwork account to ingest jobs.
              </div>
            ) : null}
            {snapshot.emptyStates.noPreferences ? (
              <div className="rounded-2xl border border-border/75 bg-secondary/70 p-4 text-sm text-muted-foreground">
                Save preferences in onboarding/settings to activate matching.
              </div>
            ) : null}
            {snapshot.emptyStates.noSyncedProfile && !snapshot.emptyStates.noConnection ? (
              <div className="rounded-2xl border border-border/75 bg-secondary/70 p-4 text-sm text-muted-foreground">
                Profile has not been synced yet. Run refresh to pull latest profile data.
              </div>
            ) : null}
            {snapshot.emptyStates.noJobsFound &&
            !snapshot.emptyStates.noConnection &&
            !snapshot.emptyStates.noPreferences ? (
              <div className="rounded-2xl border border-border/75 bg-secondary/70 p-4 text-sm text-muted-foreground">
                No jobs found yet. Try updating keywords or run refresh later.
              </div>
            ) : null}

            {snapshot.jobs.map((job) => (
              <div
                className="rounded-2xl border border-border/75 bg-white/84 p-5 shadow-sm"
                key={job.id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{job.title}</p>
                      <Badge className="border border-primary/15 bg-primary/10 text-primary">
                        Score {job.overallScore}
                      </Badge>
                      <Badge>{job.state}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {job.summary || "No description available."}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div className="rounded-2xl border border-border/70 bg-secondary/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Top reason
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground">
                          {job.explanation.topReasons?.[0] ??
                            "Scored using your current profile and preferences."}
                        </p>
                      </div>
                      {job.explanation.warnings?.[0] ? (
                        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-warning-foreground">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                            Warning
                          </p>
                          <p className="mt-2">{job.explanation.warnings[0]}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                    <Link
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      href={`/dashboard/jobs/${job.id}`}
                    >
                      Open detail
                    </Link>
                    <form action={`/api/jobs/${job.id}/save`} method="post" className="w-full sm:w-auto lg:w-full">
                      <Button className="w-full" size="sm" variant="ghost" type="submit">
                        Save
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refresh pipeline</CardTitle>
            <CardDescription>
              Keep the workspace current without turning the product into automation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderRefreshMessage(refreshStatus) ? (
              <div className="rounded-2xl border border-border/75 bg-secondary/70 p-3 text-sm text-muted-foreground">
                {renderRefreshMessage(refreshStatus)}
              </div>
            ) : null}
            {cleanupStatus === "success" ? (
              <div className="rounded-2xl border border-border/75 bg-secondary/70 p-3 text-sm text-muted-foreground">
                Expired cache cleanup completed.
              </div>
            ) : null}
            {cleanupStatus === "error" ? (
              <div className="rounded-2xl border border-warning/30 bg-warning/10 p-3 text-sm text-amber-700">
                Cleanup failed. Try again.
              </div>
            ) : null}
            <div className="rounded-2xl border border-border/75 bg-secondary/70 p-4 text-sm text-muted-foreground">
              Manual refresh is rate-limited and queued to avoid aggressive provider calls.
            </div>
            <div className="rounded-2xl border border-border/75 bg-white/80 p-4 text-sm leading-6 text-muted-foreground">
              This keeps cache short-lived and rankings deterministic. Dismissed jobs are hidden
              from the default feed.
            </div>
            <div className="flex flex-wrap gap-3">
              <form action="/api/jobs/refresh" method="post">
                <Button type="submit">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh jobs now
                </Button>
              </form>
              <Link
                className={cn(buttonVariants({ variant: "outline" }))}
                href="/dashboard/onboarding"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Adjust preferences
              </Link>
            </div>
            <form action="/api/jobs/cleanup" method="post">
              <Button variant="outline" type="submit">
                Cleanup expired cache
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

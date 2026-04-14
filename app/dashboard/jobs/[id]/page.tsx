import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleAlert, ExternalLink, Sparkles, Star } from "lucide-react";

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
import { getJobById } from "@/server/repos/job-repo";
import { getJobScore } from "@/server/repos/job-score-repo";
import { getJobUserState } from "@/server/repos/job-user-state-repo";
import { getOrGenerateProposalAssist } from "@/server/services/proposal-assist-service";

type JobPageSearchParams = Record<string, string | string[] | undefined>;

export default async function JobDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<JobPageSearchParams>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const assistStatus = Array.isArray(query.assist) ? query.assist[0] : query.assist;

  const [job, score, state, assistResult] = await Promise.all([
    getJobById(id),
    getJobScore(user.id, id),
    getJobUserState(user.id, id),
    getOrGenerateProposalAssist(user.id, id)
  ]);

  if (!job) {
    notFound();
  }

  const explanation = (score?.explanation ?? {
    topReasons: [],
    warnings: [],
    matchedKeywords: [],
    missingSignals: [],
    warningLevel: "none"
  }) as {
    topReasons: string[];
    warnings: string[];
    matchedKeywords: string[];
    missingSignals: string[];
    warningLevel?: "none" | "low" | "medium" | "high";
  };

  const assist = assistResult.ok ? assistResult.assist : null;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Job detail"
        title={job.title}
        description="Review the score, the strongest matching signals, and any warnings before deciding whether to pursue the opportunity on Upwork."
        actions={
          <>
            <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
            <Button variant="outline" type="button">
              <ExternalLink className="mr-2 h-4 w-4" />
              Apply on Upwork
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/75 bg-white/84 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current state
          </p>
          <p className="mt-3 text-2xl font-semibold">{state?.state ?? "NEW"}</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
            Score
          </p>
          <p className="mt-3 text-2xl font-semibold text-primary">{score?.overallScore ?? "N/A"}</p>
        </div>
        <div className="rounded-2xl border border-border/75 bg-white/84 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Contract
          </p>
          <p className="mt-3 text-2xl font-semibold">{job.contractType ?? "Unknown"}</p>
        </div>
        <div className="rounded-2xl border border-border/75 bg-white/84 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Budget
          </p>
          <p className="mt-3 text-lg font-semibold">
            {formatCurrency(job.hourlyMaxUsd ?? job.fixedBudgetUsd)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity summary</CardTitle>
          <CardDescription>
            Fast scan information for deciding whether this job deserves deeper attention.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="rounded-2xl border border-border/75 bg-secondary/60 p-5 leading-7 text-muted-foreground">
            {job.description}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
              <p className="font-medium">Budget</p>
              <p className="mt-1 text-muted-foreground">
                Hourly: {formatCurrency(job.hourlyMinUsd)} - {formatCurrency(job.hourlyMaxUsd)}
              </p>
              <p className="text-muted-foreground">Fixed: {formatCurrency(job.fixedBudgetUsd)}</p>
            </div>
            <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
              <p className="font-medium">Metadata</p>
              <p className="mt-1 text-muted-foreground">
                Contract: {job.contractType ?? "Unknown"}
              </p>
              <p className="text-muted-foreground">
                Experience: {job.experienceLevel ?? "Unknown"}
              </p>
              <p className="text-muted-foreground">Category: {job.category ?? "Unknown"}</p>
            </div>
          </div>

          {score ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
                Skill score: {score.skillScore}
              </div>
              <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
                Keyword score: {score.keywordScore}
              </div>
              <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
                Budget score: {score.budgetScore}
              </div>
              <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
                Preference score: {score.preferenceScore}
              </div>
              <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
                Freshness score: {score.freshnessScore}
              </div>
              <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
                Penalty score: {score.penaltyScore}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <p className="font-medium">Why this matches</p>
              </div>
              <ul className="mt-3 list-disc pl-4 text-muted-foreground">
                {explanation.topReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-warning/25 bg-warning/10 p-4">
              <div className="flex items-center gap-2">
                <CircleAlert className="h-4 w-4 text-warning-foreground" />
                <p className="font-medium text-warning-foreground">
                  Warnings ({explanation.warningLevel ?? "none"})
                </p>
              </div>
              <ul className="mt-3 list-disc pl-4 text-warning-foreground/90">
                {explanation.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-border/75 bg-white/82 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="font-medium">Proposal guidance (advisory only)</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upmatch provides guidance only. Final writing and submission happen on Upwork.
                </p>
              </div>
              <form action={`/api/jobs/${job.id}/proposal-assist`} method="post">
                <button
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  type="submit"
                >
                  Generate proposal guidance
                </button>
              </form>
            </div>

            {assistStatus === "generated" ? (
              <p className="mt-3 text-xs text-emerald-700">Guidance refreshed.</p>
            ) : null}
            {assistStatus === "error" ? (
              <p className="mt-3 text-xs text-amber-700">Could not refresh guidance right now.</p>
            ) : null}

            {assist ? (
              <div className="mt-4 space-y-4 text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Opening angle</p>
                  <p>{assist.openingAngle ?? "No opening angle generated yet."}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Key proof points</p>
                  <ul className="list-disc pl-4">
                    {assist.keyProofPoints.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Risks to address</p>
                  <ul className="list-disc pl-4">
                    {assist.risksToAddress.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Smart client questions</p>
                  <ul className="list-disc pl-4">
                    {assist.clientQuestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tone guidance</p>
                  <p>{assist.toneGuidance ?? "No tone guidance generated yet."}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">No guidance available yet.</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <form action={`/api/jobs/${job.id}/save`} method="post" className="w-full sm:w-auto">
              <button className={cn(buttonVariants({ size: "default" }), "w-full sm:w-auto")} type="submit">
                Save job
              </button>
            </form>
            <form action={`/api/jobs/${job.id}/dismiss`} method="post" className="w-full sm:w-auto">
              <button
                className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full sm:w-auto")}
                type="submit"
              >
                Dismiss job
              </button>
            </form>
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "default" }), "w-full sm:w-auto")}
              href="/dashboard"
            >
              Back to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

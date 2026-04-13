import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import { cn, formatCurrency } from "@/lib/utils";
import { getJobById } from "@/server/repos/job-repo";
import { getJobScore } from "@/server/repos/job-score-repo";
import { getJobUserState } from "@/server/repos/job-user-state-repo";
import { notFound } from "next/navigation";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const [job, score, state] = await Promise.all([
    getJobById(id),
    getJobScore(user.id, id),
    getJobUserState(user.id, id)
  ]);

  if (!job) {
    notFound();
  }

  const explanation = (score?.explanation ?? {
    topReasons: [],
    warnings: [],
    matchedKeywords: [],
    missingSignals: []
  }) as {
    topReasons: string[];
    warnings: string[];
    matchedKeywords: string[];
    missingSignals: string[];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{job.title}</CardTitle>
            <Badge>{state?.state ?? "NEW"}</Badge>
            {score && <Badge className="bg-transparent border border-border text-foreground">Score {score.overallScore}</Badge>}
          </div>
          <CardDescription>
            Normalized marketplace job with deterministic score breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="rounded-2xl border p-4 text-muted-foreground">{job.description}</div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <p className="font-medium">Budget</p>
              <p className="mt-1 text-muted-foreground">
                Hourly: {formatCurrency(job.hourlyMinUsd ? Number(job.hourlyMinUsd) : null)} - {formatCurrency(job.hourlyMaxUsd ? Number(job.hourlyMaxUsd) : null)}
              </p>
              <p className="text-muted-foreground">
                Fixed: {formatCurrency(job.fixedBudgetUsd ? Number(job.fixedBudgetUsd) : null)}
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="font-medium">Metadata</p>
              <p className="mt-1 text-muted-foreground">Contract: {job.contractType ?? "Unknown"}</p>
              <p className="text-muted-foreground">Experience: {job.experienceLevel ?? "Unknown"}</p>
              <p className="text-muted-foreground">Category: {job.category ?? "Unknown"}</p>
            </div>
          </div>

          {score && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border p-4">Skill score: {score.skillScore}</div>
              <div className="rounded-2xl border p-4">Keyword score: {score.keywordScore}</div>
              <div className="rounded-2xl border p-4">Budget score: {score.budgetScore}</div>
              <div className="rounded-2xl border p-4">Preference score: {score.preferenceScore}</div>
              <div className="rounded-2xl border p-4">Freshness score: {score.freshnessScore}</div>
              <div className="rounded-2xl border p-4">Penalty score: {score.penaltyScore}</div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <p className="font-medium">Top reasons</p>
              <ul className="mt-2 list-disc pl-4 text-muted-foreground">
                {explanation.topReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="font-medium">Warnings</p>
              <ul className="mt-2 list-disc pl-4 text-muted-foreground">
                {explanation.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border p-4 text-muted-foreground">
            Proposal assist (coming soon): this section will provide guidance for proposal drafting after human review.
          </div>

          <div className="flex flex-wrap gap-3">
            <form action={`/api/jobs/${job.id}/save`} method="post">
              <button className={cn(buttonVariants({ size: "default" }))} type="submit">
                Save job
              </button>
            </form>
            <form action={`/api/jobs/${job.id}/dismiss`} method="post">
              <button className={cn(buttonVariants({ variant: "outline", size: "default" }))} type="submit">
                Dismiss job
              </button>
            </form>
            <Link className={cn(buttonVariants({ variant: "ghost", size: "default" }))} href="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

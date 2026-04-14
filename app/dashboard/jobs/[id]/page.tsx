import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/user";
import { cn, formatCurrency } from "@/lib/utils";
import { getJobById } from "@/server/repos/job-repo";
import { getJobScore } from "@/server/repos/job-score-repo";
import { getJobUserState } from "@/server/repos/job-user-state-repo";
import { getOrGenerateProposalAssist } from "@/server/services/proposal-assist-service";

export default async function JobDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job no longer available</CardTitle>
          <CardDescription>
            This cached job may have expired and been removed during cleanup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link className={cn(buttonVariants({ variant: "outline" }))} href="/dashboard">
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    );
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
              <p className="text-muted-foreground">Fixed: {formatCurrency(job.fixedBudgetUsd ? Number(job.fixedBudgetUsd) : null)}</p>
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
              <p className="font-medium">Warnings ({explanation.warningLevel ?? "none"})</p>
              <ul className="mt-2 list-disc pl-4 text-muted-foreground">
                {explanation.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Proposal guidance (advisory only)</p>
                <p className="text-xs text-muted-foreground">
                  Upmatch provides guidance only. Final writing and submission happen on Upwork.
                </p>
              </div>
              <form action={`/api/jobs/${job.id}/proposal-assist`} method="post">
                <button className={cn(buttonVariants({ variant: "outline", size: "sm" }))} type="submit">
                  Generate proposal guidance
                </button>
              </form>
            </div>

            {assistStatus === "generated" && (
              <p className="mt-3 text-xs text-emerald-700">Guidance refreshed.</p>
            )}
            {assistStatus === "error" && (
              <p className="mt-3 text-xs text-amber-700">Could not refresh guidance right now.</p>
            )}

            {assist ? (
              <div className="mt-4 space-y-4 text-muted-foreground">
                <div>
                  <p className="text-foreground font-medium">Opening angle</p>
                  <p>{assist.openingAngle ?? "No opening angle generated yet."}</p>
                </div>
                <div>
                  <p className="text-foreground font-medium">Key proof points</p>
                  <ul className="list-disc pl-4">
                    {assist.keyProofPoints.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-foreground font-medium">Risks to address</p>
                  <ul className="list-disc pl-4">
                    {assist.risksToAddress.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-foreground font-medium">Smart client questions</p>
                  <ul className="list-disc pl-4">
                    {assist.clientQuestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-foreground font-medium">Tone guidance</p>
                  <p>{assist.toneGuidance ?? "No tone guidance generated yet."}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">No guidance available yet.</p>
            )}
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

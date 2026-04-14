import "server-only";

import { getFreelancerProfileByUserId } from "@/server/repos/freelancer-profile-repo";
import { getJobById } from "@/server/repos/job-repo";
import { getJobScore } from "@/server/repos/job-score-repo";
import { getPreferenceByUserId } from "@/server/repos/preference-repo";
import { getProposalAssist, upsertProposalAssist } from "@/server/repos/proposal-assist-repo";

function logEvent(event: string, payload: Record<string, unknown>) {
  console.info(JSON.stringify({ event, ...payload }));
}

function takeNonEmpty(values: Array<string | null | undefined>, limit = 4) {
  return values.map((value) => value?.trim()).filter(Boolean).slice(0, limit) as string[];
}

export async function generateProposalAssist(userId: string, jobId: string) {
  logEvent("proposal.assist.started", { userId, jobId });
  const [job, score, profile, preference] = await Promise.all([
    getJobById(jobId),
    getJobScore(userId, jobId),
    getFreelancerProfileByUserId(userId),
    getPreferenceByUserId(userId)
  ]);

  if (!job) {
    return {
      ok: false,
      reason: "JOB_NOT_FOUND"
    } as const;
  }

  const explanation = (score?.explanation ?? {}) as {
    topReasons?: string[];
    warnings?: string[];
    matchedKeywords?: string[];
    missingSignals?: string[];
  };

  const openingAngle =
    profile?.profileTitle && job.title
      ? `Position your profile as ${profile.profileTitle} for this ${job.title} brief, emphasizing measurable outcomes and speed-to-value.`
      : `Lead with why your prior work maps directly to this ${job.title} scope and timeline.`;

  const keyProofPoints = takeNonEmpty([
    ...(explanation.topReasons ?? []),
    profile?.overview,
    ...(profile?.skills ?? []).map((skill) => `Demonstrate recent delivery using ${skill}`)
  ]);

  const risksToAddress = takeNonEmpty([
    ...(explanation.warnings ?? []),
    ...(explanation.missingSignals ?? []),
    job.experienceLevel ? `Clarify fit for ${job.experienceLevel} expectations.` : null
  ]);

  const clientQuestions = takeNonEmpty([
    `What outcome would define success in the first 2 weeks for this ${job.title} project?`,
    job.contractType ? `Do you expect this engagement to remain ${job.contractType.toLowerCase()} through delivery?` : null,
    preference?.minimumHourlyRateUsd
      ? `Is there flexibility in budget for stronger domain expertise and faster delivery?`
      : null,
    `Which existing assets (designs, docs, codebase access) are ready for handoff on day one?`
  ]);

  const toneGuidance =
    risksToAddress.length > 0
      ? "Use a confident but risk-aware tone: acknowledge constraints, then present mitigation steps and concrete milestones."
      : "Use concise, outcome-first language with concrete evidence and a clear first milestone.";

  const assist = await upsertProposalAssist({
    userId,
    jobId,
    openingAngle,
    keyProofPoints,
    risksToAddress,
    clientQuestions,
    toneGuidance
  });

  logEvent("proposal.assist.succeeded", { userId, jobId, assistId: assist.id });
  return {
    ok: true,
    assist
  } as const;
}

export async function getOrGenerateProposalAssist(userId: string, jobId: string) {
  const existing = await getProposalAssist(userId, jobId);
  if (existing) {
    return {
      ok: true,
      assist: existing,
      source: "cache"
    } as const;
  }

  const generated = await generateProposalAssist(userId, jobId);
  if (!generated.ok) {
    return generated;
  }

  return {
    ok: true,
    assist: generated.assist,
    source: "generated"
  } as const;
}

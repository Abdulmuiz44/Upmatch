import "server-only";

import { ContractTypePreference, type Job, type UserPreference } from "@prisma/client";

import { getFreelancerProfileByUserId } from "@/server/repos/freelancer-profile-repo";
import { getActiveJobs } from "@/server/repos/job-repo";
import { upsertJobScore } from "@/server/repos/job-score-repo";
import { getPreferenceByUserId } from "@/server/repos/preference-repo";

export type RankingExplanation = {
  topReasons: string[];
  warnings: string[];
  matchedKeywords: string[];
  missingSignals: string[];
};

export type RankingResult = {
  overallScore: number;
  skillScore: number;
  keywordScore: number;
  budgetScore: number;
  preferenceScore: number;
  freshnessScore: number;
  penaltyScore: number;
  explanation: RankingExplanation;
};

function tokenize(...inputs: Array<string | null | undefined>) {
  return new Set(
    inputs
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function scoreJob(input: {
  preference: UserPreference;
  profile: {
    profileTitle: string | null;
    overview: string | null;
    skills: string[];
  } | null;
  job: Job;
  now?: Date;
}): RankingResult {
  const now = input.now ?? new Date();
  const jobTextTokens = tokenize(input.job.title, input.job.description, input.job.category, ...(input.job.skills ?? []));

  const preferredKeywords = input.preference.preferredKeywords.map((keyword) => keyword.toLowerCase());
  const preferredRoles = input.preference.preferredRoles.map((role) => role.toLowerCase());
  const excludedKeywords = input.preference.excludedKeywords.map((keyword) => keyword.toLowerCase());
  const preferredIndustries = input.preference.preferredIndustries.map((industry) => industry.toLowerCase());

  const matchedKeywords = preferredKeywords.filter((keyword) => jobTextTokens.has(keyword));
  const matchedRoles = preferredRoles.filter((role) => jobTextTokens.has(role));
  const matchedIndustries = preferredIndustries.filter((industry) => jobTextTokens.has(industry));

  const profileSkillSet = new Set((input.profile?.skills ?? []).map((skill) => skill.toLowerCase()));
  const jobSkillSet = new Set((input.job.skills ?? []).map((skill) => skill.toLowerCase()));
  const sharedSkillCount = [...jobSkillSet].filter((skill) => profileSkillSet.has(skill)).length;

  const keywordScore = clamp(matchedKeywords.length * 10 + matchedRoles.length * 8, 0, 25);
  const skillScore = clamp(sharedSkillCount * 6, 0, 25);

  let budgetScore = 10;
  const minimumHourly = input.preference.minimumHourlyRateUsd
    ? Number(input.preference.minimumHourlyRateUsd)
    : null;
  const minimumFixed = input.preference.minimumFixedBudgetUsd
    ? Number(input.preference.minimumFixedBudgetUsd)
    : null;

  if (input.preference.contractType === ContractTypePreference.HOURLY || input.preference.contractType === ContractTypePreference.BOTH) {
    if (minimumHourly && input.job.hourlyMaxUsd && Number(input.job.hourlyMaxUsd) >= minimumHourly) {
      budgetScore += 6;
    } else if (minimumHourly && input.job.hourlyMaxUsd && Number(input.job.hourlyMaxUsd) < minimumHourly) {
      budgetScore -= 6;
    }
  }

  if (input.preference.contractType === ContractTypePreference.FIXED_PRICE || input.preference.contractType === ContractTypePreference.BOTH) {
    if (minimumFixed && input.job.fixedBudgetUsd && Number(input.job.fixedBudgetUsd) >= minimumFixed) {
      budgetScore += 6;
    } else if (minimumFixed && input.job.fixedBudgetUsd && Number(input.job.fixedBudgetUsd) < minimumFixed) {
      budgetScore -= 6;
    }
  }

  budgetScore = clamp(budgetScore, 0, 20);

  let preferenceScore = 0;
  if (matchedRoles.length) preferenceScore += 8;
  if (matchedIndustries.length) preferenceScore += 6;
  if (input.preference.contractType !== ContractTypePreference.BOTH) {
    const isHourly = input.job.contractType?.toUpperCase().includes("HOURLY");
    const isFixed = input.job.contractType?.toUpperCase().includes("FIXED");
    if (input.preference.contractType === ContractTypePreference.HOURLY && isHourly) preferenceScore += 6;
    if (input.preference.contractType === ContractTypePreference.FIXED_PRICE && isFixed) preferenceScore += 6;
  } else {
    preferenceScore += 3;
  }
  preferenceScore = clamp(preferenceScore, 0, 15);

  const publishedAt = input.job.publishedAt ?? input.job.firstSeenAt;
  const hoursOld = Math.max(0, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
  const freshnessScore = clamp(15 - Math.floor(hoursOld / 12), 0, 15);

  let penaltyScore = 0;
  const violatedExclusions = excludedKeywords.filter((keyword) => jobTextTokens.has(keyword));
  penaltyScore += violatedExclusions.length * 8;

  const missingSignals: string[] = [];
  if (!matchedKeywords.length) missingSignals.push("No preferred keywords matched");
  if (!sharedSkillCount) missingSignals.push("No overlap with profile skills");

  const warnings = [...violatedExclusions.map((word) => `Contains excluded keyword: ${word}`)];
  if (budgetScore <= 6) warnings.push("Budget may be below your configured floor");

  const topReasons = [
    matchedKeywords.length ? `${matchedKeywords.length} preferred keywords matched` : null,
    sharedSkillCount ? `${sharedSkillCount} profile skills overlap` : null,
    matchedRoles.length ? `Role alignment with ${matchedRoles.join(", ")}` : null,
    freshnessScore >= 10 ? "Freshly published opportunity" : null
  ].filter(Boolean) as string[];

  const overallScore = clamp(
    Math.round(skillScore + keywordScore + budgetScore + preferenceScore + freshnessScore - penaltyScore),
    0,
    100
  );

  return {
    overallScore,
    skillScore,
    keywordScore,
    budgetScore,
    preferenceScore,
    freshnessScore,
    penaltyScore,
    explanation: {
      topReasons: topReasons.slice(0, 3),
      warnings,
      matchedKeywords,
      missingSignals
    }
  };
}

export async function rankJobsForUser(userId: string) {
  const [preference, profile, jobs] = await Promise.all([
    getPreferenceByUserId(userId),
    getFreelancerProfileByUserId(userId),
    getActiveJobs()
  ]);

  if (!preference) {
    return {
      ok: false,
      reason: "PREFERENCES_REQUIRED"
    } as const;
  }

  let processed = 0;

  for (const job of jobs) {
    const score = scoreJob({
      preference,
      profile: profile
        ? {
            profileTitle: profile.profileTitle,
            overview: profile.overview,
            skills: profile.skills
          }
        : null,
      job
    });

    await upsertJobScore({
      userId,
      jobId: job.id,
      score
    });

    processed += 1;
  }

  return {
    ok: true,
    processed
  } as const;
}

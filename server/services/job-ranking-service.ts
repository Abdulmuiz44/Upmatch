import "server-only";

import { ContractTypePreference, type Job, type UserPreference } from "@prisma/client";

import { getFreelancerProfileByUserId } from "@/server/repos/freelancer-profile-repo";
import { getActiveJobs } from "@/server/repos/job-repo";
import { upsertJobScore } from "@/server/repos/job-score-repo";
import { getPreferenceByUserId } from "@/server/repos/preference-repo";
import { rankingConfig, type WarningLevel } from "@/server/services/job-ranking-config";

export type RankingExplanation = {
  topReasons: string[];
  warnings: string[];
  matchedKeywords: string[];
  missingSignals: string[];
  warningLevel: WarningLevel;
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

function detectContractType(contractType: string | null) {
  const source = contractType?.toUpperCase() ?? "";
  return {
    isHourly: source.includes("HOURLY"),
    isFixed: source.includes("FIXED") || source.includes("PRICE")
  };
}

function getWarningLevel(penaltyScore: number, warnings: string[]): WarningLevel {
  if (!warnings.length) return "none";
  if (penaltyScore >= 20) return "high";
  if (penaltyScore >= 12) return "medium";
  return "low";
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
  const jobTokens = toTokenSet([
    input.job.title,
    input.job.description,
    input.job.category,
    ...(input.job.skills ?? [])
  ]);

  const preferredKeywords = input.preference.preferredKeywords.map(normalizeToken).filter(Boolean);
  const preferredRoles = input.preference.preferredRoles.map(normalizeToken).filter(Boolean);
  const excludedKeywords = input.preference.excludedKeywords.map(normalizeToken).filter(Boolean);
  const preferredIndustries = input.preference.preferredIndustries.map(normalizeToken).filter(Boolean);

  const matchedKeywords = preferredKeywords.filter((token) => jobTokens.has(token));
  const matchedRoles = preferredRoles.filter((token) => jobTokens.has(token));
  const matchedIndustries = preferredIndustries.filter((token) => jobTokens.has(token));

  const profileSkillSet = toTokenSet(input.profile?.skills ?? []);
  const jobSkillSet = toTokenSet(input.job.skills ?? []);
  const sharedSkills = [...jobSkillSet].filter((skill) => profileSkillSet.has(skill));

  const keywordScore = clamp(
    matchedKeywords.length * rankingConfig.multipliers.keywordMatch +
      matchedRoles.length * rankingConfig.multipliers.roleMatch,
    0,
    rankingConfig.scoreCaps.keyword
  );

  const skillScore = clamp(
    sharedSkills.length * rankingConfig.multipliers.sharedSkill,
    0,
    rankingConfig.scoreCaps.skill
  );

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

  let budgetScore = 0;
  const warnings: string[] = [];

  if (minimumHourly && input.job.hourlyMaxUsd) {
    budgetScore +=
      Number(input.job.hourlyMaxUsd) >= minimumHourly
        ? rankingConfig.multipliers.hourlyBudgetHit
        : -rankingConfig.multipliers.budgetMissPenalty;
    if (Number(input.job.hourlyMaxUsd) < minimumHourly) {
      warnings.push("Hourly budget appears below your minimum preference.");
    }
  }

  if (minimumFixed && input.job.fixedBudgetUsd) {
    budgetScore +=
      Number(input.job.fixedBudgetUsd) >= minimumFixed
        ? rankingConfig.multipliers.fixedBudgetHit
        : -rankingConfig.multipliers.budgetMissPenalty;
    if (Number(input.job.fixedBudgetUsd) < minimumFixed) {
      warnings.push("Fixed budget appears below your minimum preference.");
    }
  }

  budgetScore = clamp(budgetScore + Math.floor(rankingConfig.scoreCaps.budget / 2), 0, rankingConfig.scoreCaps.budget);

  let preferenceScore = matchedIndustries.length * rankingConfig.multipliers.industryMatch;
  const contractHint = detectContractType(input.job.contractType);

  if (input.preference.contractType !== ContractTypePreference.BOTH) {
    if (
      (input.preference.contractType === ContractTypePreference.HOURLY && contractHint.isHourly) ||
      (input.preference.contractType === ContractTypePreference.FIXED_PRICE && contractHint.isFixed)
    ) {
      preferenceScore += rankingConfig.multipliers.contractMatch;
    } else {
      warnings.push("Contract type may not match your configured preference.");
      preferenceScore -= rankingConfig.multipliers.contractMismatchPenalty;
    }
  }
  preferenceScore = clamp(preferenceScore, 0, rankingConfig.scoreCaps.preference);

  const publishedAt = input.job.publishedAt ?? input.job.firstSeenAt;
  const hoursOld = Math.max(0, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
  const freshnessScore = clamp(
    hoursOld <= rankingConfig.freshness.fullScoreHours
      ? rankingConfig.scoreCaps.freshness
      : rankingConfig.scoreCaps.freshness -
          Math.floor((hoursOld - rankingConfig.freshness.fullScoreHours) / rankingConfig.freshness.degradeEveryHours),
    0,
    rankingConfig.scoreCaps.freshness
  );

  let penaltyScore = 0;
  for (const token of excludedKeywords) {
    if (jobTokens.has(token)) {
      penaltyScore += token.length > 7
        ? rankingConfig.multipliers.exclusionPenaltyHard
        : rankingConfig.multipliers.exclusionPenaltySoft;
      warnings.push(`Contains excluded keyword: ${token}`);
    }
  }

  const missingSignals: string[] = [];
  if (!matchedKeywords.length && !matchedRoles.length) {
    missingSignals.push("No preferred keyword or role matches detected");
  }
  if (!sharedSkills.length) {
    missingSignals.push("No overlap with your profile skills");
  }

  const topReasons = [
    matchedKeywords.length ? `${matchedKeywords.length} preferred keywords matched` : null,
    sharedSkills.length ? `${sharedSkills.length} skill signals overlap` : null,
    matchedRoles.length ? `Role match on: ${matchedRoles.slice(0, 2).join(", ")}` : null,
    freshnessScore >= 10 ? "Recently posted opportunity" : null
  ].filter(Boolean) as string[];

  const overallScore = clamp(
    skillScore + keywordScore + budgetScore + preferenceScore + freshnessScore - penaltyScore,
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
      missingSignals,
      warningLevel: getWarningLevel(penaltyScore, warnings)
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

    await upsertJobScore({ userId, jobId: job.id, score });
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

import "server-only";

export const rankingConfig = {
  scoreCaps: {
    skill: 30,
    keyword: 25,
    budget: 15,
    preference: 15,
    freshness: 15
  },
  multipliers: {
    sharedSkill: 7,
    keywordMatch: 9,
    roleMatch: 10,
    industryMatch: 6,
    hourlyBudgetHit: 5,
    fixedBudgetHit: 5,
    budgetMissPenalty: 6,
    contractMatch: 5,
    contractMismatchPenalty: 7,
    exclusionPenaltyHard: 14,
    exclusionPenaltySoft: 8
  },
  freshness: {
    fullScoreHours: 8,
    degradeEveryHours: 12
  }
} as const;

export type WarningLevel = "none" | "low" | "medium" | "high";

import "server-only";

import { prisma } from "@/lib/prisma";
import type { RankingExplanation, RankingResult } from "@/server/services/job-ranking-service";

export async function upsertJobScore(input: {
  userId: string;
  jobId: string;
  score: RankingResult;
}) {
  return prisma.jobScore.upsert({
    where: {
      userId_jobId: {
        userId: input.userId,
        jobId: input.jobId
      }
    },
    create: {
      userId: input.userId,
      jobId: input.jobId,
      overallScore: input.score.overallScore,
      skillScore: input.score.skillScore,
      keywordScore: input.score.keywordScore,
      budgetScore: input.score.budgetScore,
      preferenceScore: input.score.preferenceScore,
      freshnessScore: input.score.freshnessScore,
      penaltyScore: input.score.penaltyScore,
      explanation: input.score.explanation as RankingExplanation
    },
    update: {
      overallScore: input.score.overallScore,
      skillScore: input.score.skillScore,
      keywordScore: input.score.keywordScore,
      budgetScore: input.score.budgetScore,
      preferenceScore: input.score.preferenceScore,
      freshnessScore: input.score.freshnessScore,
      penaltyScore: input.score.penaltyScore,
      explanation: input.score.explanation as RankingExplanation
    }
  });
}

export function getRankedJobsForUser(userId: string) {
  return prisma.jobScore.findMany({
    where: {
      userId,
      job: {
        expiresAt: {
          gt: new Date()
        }
      }
    },
    orderBy: [{ overallScore: "desc" }, { updatedAt: "desc" }],
    include: {
      job: true
    }
  });
}

export function getJobScore(userId: string, jobId: string) {
  return prisma.jobScore.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId
      }
    }
  });
}

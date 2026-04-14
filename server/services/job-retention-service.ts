import "server-only";

import { prisma } from "@/lib/prisma";

export type CleanupSummary = {
  expiredJobsDeleted: number;
  proposalAssistsDeleted: number;
  scoresDeleted: number;
  statesDeleted: number;
};

export function buildCleanupPlan(expiredJobIds: string[]) {
  return {
    shouldCleanup: expiredJobIds.length > 0,
    totalJobs: expiredJobIds.length
  };
}

export async function cleanupExpiredJobs(): Promise<CleanupSummary> {
  const expiredJobs = await prisma.job.findMany({
    where: {
      expiresAt: {
        lte: new Date()
      }
    },
    select: {
      id: true
    }
  });

  const expiredJobIds = expiredJobs.map((job) => job.id);
  const plan = buildCleanupPlan(expiredJobIds);
  console.info(JSON.stringify({ event: "jobs.cleanup.plan", ...plan }));

  if (!plan.shouldCleanup) {
    return {
      expiredJobsDeleted: 0,
      proposalAssistsDeleted: 0,
      scoresDeleted: 0,
      statesDeleted: 0
    };
  }

  const [proposalAssistsDeleted, scoresDeleted, statesDeleted] = await Promise.all([
    prisma.proposalAssist.deleteMany({ where: { jobId: { in: expiredJobIds } } }),
    prisma.jobScore.deleteMany({ where: { jobId: { in: expiredJobIds } } }),
    prisma.jobUserState.deleteMany({ where: { jobId: { in: expiredJobIds } } })
  ]);

  const deletedJobs = await prisma.job.deleteMany({
    where: {
      id: {
        in: expiredJobIds
      }
    }
  });

  return {
    expiredJobsDeleted: deletedJobs.count,
    proposalAssistsDeleted: proposalAssistsDeleted.count,
    scoresDeleted: scoresDeleted.count,
    statesDeleted: statesDeleted.count
  };
}

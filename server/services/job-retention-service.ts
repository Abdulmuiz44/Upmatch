import "server-only";

import { query } from "@/lib/db/client";

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
  const expiredJobs = await query<{ id: string }>(
    `SELECT id FROM jobs WHERE expires_at <= NOW()`
  );

  const expiredJobIds = expiredJobs.rows.map((job) => job.id);
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
    query(
      `DELETE FROM proposal_assists WHERE job_id = ANY($1::text[])`,
      [expiredJobIds]
    ),
    query(
      `DELETE FROM job_scores WHERE job_id = ANY($1::text[])`,
      [expiredJobIds]
    ),
    query(
      `DELETE FROM job_user_states WHERE job_id = ANY($1::text[])`,
      [expiredJobIds]
    )
  ]);

  const deletedJobs = await query(
    `DELETE FROM jobs WHERE id = ANY($1::text[])`,
    [expiredJobIds]
  );

  return {
    expiredJobsDeleted: deletedJobs.rowCount ?? 0,
    proposalAssistsDeleted: proposalAssistsDeleted.rowCount ?? 0,
    scoresDeleted: scoresDeleted.rowCount ?? 0,
    statesDeleted: statesDeleted.rowCount ?? 0
  };
}

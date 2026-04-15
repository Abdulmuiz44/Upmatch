import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate, toJson } from "@/lib/db/row";
import type { JobScore, JobScoreWithJob } from "@/lib/db/types";
import type { RankingExplanation, RankingResult } from "@/server/services/job-ranking-service";

type JobScoreRow = {
  id: string;
  user_id: string;
  job_id: string;
  overall_score: number;
  skill_score: number;
  keyword_score: number;
  budget_score: number;
  preference_score: number;
  freshness_score: number;
  penalty_score: number;
  explanation: JobScore["explanation"];
  created_at: Date | string;
  updated_at: Date | string;
};

type JobScoreWithJobRow = JobScoreRow & {
  job: {
    id: string;
    provider_job_id: string;
    provider_ciphertext: string | null;
    title: string;
    description: string;
    contract_type: string | null;
    experience_level: string | null;
    hourly_min_usd: string | number | null;
    hourly_max_usd: string | number | null;
    fixed_budget_usd: string | number | null;
    duration_label: string | null;
    category: string | null;
    skills: string[] | null;
    client_country: string | null;
    client_total_hires: number | null;
    client_total_posted_jobs: number | null;
    client_total_reviews: number | null;
    client_total_feedback: string | number | null;
    published_at: string | Date | null;
    first_seen_at: string | Date;
    last_seen_at: string | Date;
    expires_at: string | Date;
    raw_payload: JobScoreWithJob["job"]["rawPayload"];
    created_at: string | Date;
    updated_at: string | Date;
  };
};

function mapJobScore(row: JobScoreRow): JobScore {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    overallScore: row.overall_score,
    skillScore: row.skill_score,
    keywordScore: row.keyword_score,
    budgetScore: row.budget_score,
    preferenceScore: row.preference_score,
    freshnessScore: row.freshness_score,
    penaltyScore: row.penalty_score,
    explanation: toJson(row.explanation) ?? {},
    createdAt: toDate(row.created_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export async function upsertJobScore(input: {
  userId: string;
  jobId: string;
  score: RankingResult;
}) {
  const result = await query<JobScoreRow>(
    `INSERT INTO job_scores (
       id,
       user_id,
       job_id,
       overall_score,
       skill_score,
       keyword_score,
       budget_score,
       preference_score,
       freshness_score,
       penalty_score,
       explanation
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (user_id, job_id)
     DO UPDATE SET
       overall_score = EXCLUDED.overall_score,
       skill_score = EXCLUDED.skill_score,
       keyword_score = EXCLUDED.keyword_score,
       budget_score = EXCLUDED.budget_score,
       preference_score = EXCLUDED.preference_score,
       freshness_score = EXCLUDED.freshness_score,
       penalty_score = EXCLUDED.penalty_score,
       explanation = EXCLUDED.explanation,
       updated_at = NOW()
     RETURNING *`,
    [
      createId(),
      input.userId,
      input.jobId,
      input.score.overallScore,
      input.score.skillScore,
      input.score.keywordScore,
      input.score.budgetScore,
      input.score.preferenceScore,
      input.score.freshnessScore,
      input.score.penaltyScore,
      input.score.explanation as RankingExplanation
    ]
  );

  return mapJobScore(result.rows[0]);
}

export async function getRankedJobsForUser(userId: string): Promise<JobScoreWithJob[]> {
  const result = await query<JobScoreWithJobRow>(
    `SELECT
       job_scores.id,
       job_scores.user_id,
       job_scores.job_id,
       job_scores.overall_score,
       job_scores.skill_score,
       job_scores.keyword_score,
       job_scores.budget_score,
       job_scores.preference_score,
       job_scores.freshness_score,
       job_scores.penalty_score,
       job_scores.explanation,
       job_scores.created_at,
       job_scores.updated_at,
       to_jsonb(jobs) AS job
     FROM job_scores
     INNER JOIN jobs ON jobs.id = job_scores.job_id
     WHERE job_scores.user_id = $1
       AND jobs.expires_at > NOW()
     ORDER BY job_scores.overall_score DESC, job_scores.updated_at DESC`,
    [userId]
  );

  return result.rows.map((row) => ({
    ...mapJobScore(row),
    job: {
      id: row.job.id,
      providerJobId: row.job.provider_job_id,
      providerCiphertext: row.job.provider_ciphertext,
      title: row.job.title,
      description: row.job.description,
      contractType: row.job.contract_type,
      experienceLevel: row.job.experience_level,
      hourlyMinUsd: row.job.hourly_min_usd === null ? null : Number(row.job.hourly_min_usd),
      hourlyMaxUsd: row.job.hourly_max_usd === null ? null : Number(row.job.hourly_max_usd),
      fixedBudgetUsd: row.job.fixed_budget_usd === null ? null : Number(row.job.fixed_budget_usd),
      durationLabel: row.job.duration_label,
      category: row.job.category,
      skills: row.job.skills ?? [],
      clientCountry: row.job.client_country,
      clientTotalHires: row.job.client_total_hires,
      clientTotalPostedJobs: row.job.client_total_posted_jobs,
      clientTotalReviews: row.job.client_total_reviews,
      clientTotalFeedback:
        row.job.client_total_feedback === null ? null : Number(row.job.client_total_feedback),
      publishedAt: row.job.published_at ? new Date(row.job.published_at) : null,
      firstSeenAt: new Date(row.job.first_seen_at),
      lastSeenAt: new Date(row.job.last_seen_at),
      expiresAt: new Date(row.job.expires_at),
      rawPayload: row.job.raw_payload ?? null,
      createdAt: new Date(row.job.created_at),
      updatedAt: new Date(row.job.updated_at)
    }
  }));
}

export async function getJobScore(userId: string, jobId: string) {
  const result = await query<JobScoreRow>(
    `SELECT * FROM job_scores WHERE user_id = $1 AND job_id = $2 LIMIT 1`,
    [userId, jobId]
  );

  return result.rows[0] ? mapJobScore(result.rows[0]) : null;
}

import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate, toJson, toNumber, toStringArray } from "@/lib/db/row";
import type { Job } from "@/lib/db/types";
import type { NormalizedJobRecord } from "@/lib/upwork/queries";

const JOB_CACHE_TTL_HOURS = 12;

type JobRow = {
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
  published_at: Date | string | null;
  first_seen_at: Date | string;
  last_seen_at: Date | string;
  expires_at: Date | string;
  raw_payload: Job["rawPayload"];
  created_at: Date | string;
  updated_at: Date | string;
};

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    providerJobId: row.provider_job_id,
    providerCiphertext: row.provider_ciphertext,
    title: row.title,
    description: row.description,
    contractType: row.contract_type,
    experienceLevel: row.experience_level,
    hourlyMinUsd: toNumber(row.hourly_min_usd),
    hourlyMaxUsd: toNumber(row.hourly_max_usd),
    fixedBudgetUsd: toNumber(row.fixed_budget_usd),
    durationLabel: row.duration_label,
    category: row.category,
    skills: toStringArray(row.skills),
    clientCountry: row.client_country,
    clientTotalHires: row.client_total_hires,
    clientTotalPostedJobs: row.client_total_posted_jobs,
    clientTotalReviews: row.client_total_reviews,
    clientTotalFeedback: toNumber(row.client_total_feedback),
    publishedAt: toDate(row.published_at),
    firstSeenAt: toDate(row.first_seen_at) as Date,
    lastSeenAt: toDate(row.last_seen_at) as Date,
    expiresAt: toDate(row.expires_at) as Date,
    rawPayload: toJson(row.raw_payload),
    createdAt: toDate(row.created_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export async function getActiveJobs() {
  const result = await query<JobRow>(
    `SELECT *
     FROM jobs
     WHERE expires_at > NOW()
     ORDER BY published_at DESC NULLS LAST, last_seen_at DESC`
  );

  return result.rows.map(mapJob);
}

export async function upsertJobsFromMarketplace(records: NormalizedJobRecord[]) {
  let inserted = 0;
  let updated = 0;

  for (const job of records) {
    const existing = await query<{ id: string }>(
      `SELECT id FROM jobs WHERE provider_job_id = $1 LIMIT 1`,
      [job.providerJobId]
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + JOB_CACHE_TTL_HOURS * 60 * 60 * 1000);

    await query(
      `INSERT INTO jobs (
         id,
         provider_job_id,
         provider_ciphertext,
         title,
         description,
         contract_type,
         experience_level,
         hourly_min_usd,
         hourly_max_usd,
         fixed_budget_usd,
         duration_label,
         category,
         skills,
         client_country,
         client_total_hires,
         client_total_posted_jobs,
         client_total_reviews,
         client_total_feedback,
         published_at,
         first_seen_at,
         last_seen_at,
         expires_at,
         raw_payload
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
         $15, $16, $17, $18, $19, $20, $21, $22, $23
       )
       ON CONFLICT (provider_job_id)
       DO UPDATE SET
         provider_ciphertext = EXCLUDED.provider_ciphertext,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         contract_type = EXCLUDED.contract_type,
         experience_level = EXCLUDED.experience_level,
         hourly_min_usd = EXCLUDED.hourly_min_usd,
         hourly_max_usd = EXCLUDED.hourly_max_usd,
         fixed_budget_usd = EXCLUDED.fixed_budget_usd,
         duration_label = EXCLUDED.duration_label,
         category = EXCLUDED.category,
         skills = EXCLUDED.skills,
         client_country = EXCLUDED.client_country,
         client_total_hires = EXCLUDED.client_total_hires,
         client_total_posted_jobs = EXCLUDED.client_total_posted_jobs,
         client_total_reviews = EXCLUDED.client_total_reviews,
         client_total_feedback = EXCLUDED.client_total_feedback,
         published_at = EXCLUDED.published_at,
         last_seen_at = EXCLUDED.last_seen_at,
         expires_at = EXCLUDED.expires_at,
         raw_payload = EXCLUDED.raw_payload,
         updated_at = NOW()`,
      [
        createId(),
        job.providerJobId,
        job.providerCiphertext,
        job.title,
        job.description,
        job.contractType,
        job.experienceLevel,
        job.hourlyMinUsd,
        job.hourlyMaxUsd,
        job.fixedBudgetUsd,
        job.durationLabel,
        job.category,
        job.skills,
        job.clientCountry,
        job.clientTotalHires,
        job.clientTotalPostedJobs,
        job.clientTotalReviews,
        job.clientTotalFeedback,
        job.publishedAt,
        now,
        now,
        expiresAt,
        job.rawPayload
      ]
    );

    if (existing.rows[0]) {
      updated += 1;
    } else {
      inserted += 1;
    }
  }

  return {
    inserted,
    updated,
    total: records.length
  };
}

export async function getJobById(id: string) {
  const result = await query<JobRow>(
    `SELECT * FROM jobs WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] ? mapJob(result.rows[0]) : null;
}

import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate, toJson, toStringArray } from "@/lib/db/row";
import type { FreelancerProfile } from "@/lib/db/types";
import type { NormalizedFreelancerProfile } from "@/lib/upwork/queries";

type FreelancerProfileRow = {
  id: string;
  user_id: string;
  upwork_profile_id: string | null;
  profile_title: string | null;
  overview: string | null;
  hourly_rate_usd_cents: number | null;
  profile_url: string | null;
  categories: string[] | null;
  skills: string[] | null;
  raw_payload: FreelancerProfile["rawPayload"];
  synced_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function mapFreelancerProfile(row: FreelancerProfileRow): FreelancerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    upworkProfileId: row.upwork_profile_id,
    profileTitle: row.profile_title,
    overview: row.overview,
    hourlyRateUsdCents: row.hourly_rate_usd_cents,
    profileUrl: row.profile_url,
    categories: toStringArray(row.categories),
    skills: toStringArray(row.skills),
    rawPayload: toJson(row.raw_payload),
    syncedAt: toDate(row.synced_at),
    createdAt: toDate(row.created_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export async function getFreelancerProfileByUserId(userId: string) {
  const result = await query<FreelancerProfileRow>(
    `SELECT * FROM freelancer_profiles WHERE user_id = $1 LIMIT 1`,
    [userId]
  );

  return result.rows[0] ? mapFreelancerProfile(result.rows[0]) : null;
}

export async function upsertFreelancerProfile(userId: string, profile: NormalizedFreelancerProfile) {
  const result = await query<FreelancerProfileRow>(
    `INSERT INTO freelancer_profiles (
       id,
       user_id,
       upwork_profile_id,
       profile_title,
       overview,
       hourly_rate_usd_cents,
       profile_url,
       categories,
       skills,
       raw_payload,
       synced_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET
       upwork_profile_id = EXCLUDED.upwork_profile_id,
       profile_title = EXCLUDED.profile_title,
       overview = EXCLUDED.overview,
       hourly_rate_usd_cents = EXCLUDED.hourly_rate_usd_cents,
       profile_url = EXCLUDED.profile_url,
       categories = EXCLUDED.categories,
       skills = EXCLUDED.skills,
       raw_payload = EXCLUDED.raw_payload,
       synced_at = NOW(),
       updated_at = NOW()
     RETURNING *`,
    [
      createId(),
      userId,
      profile.upworkProfileId,
      profile.profileTitle,
      profile.overview,
      profile.hourlyRateUsdCents,
      profile.profileUrl,
      profile.categories,
      profile.skills,
      profile.rawPayload
    ]
  );

  return mapFreelancerProfile(result.rows[0]);
}

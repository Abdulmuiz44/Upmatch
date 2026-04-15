import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate, toNumber, toStringArray } from "@/lib/db/row";
import { type ContractTypePreference, type UserPreference } from "@/lib/db/types";

type UserPreferenceRow = {
  id: string;
  user_id: string;
  preferred_roles: string[] | null;
  preferred_keywords: string[] | null;
  excluded_keywords: string[] | null;
  preferred_industries: string[] | null;
  minimum_hourly_rate_usd: string | number | null;
  minimum_fixed_budget_usd: string | number | null;
  contract_type: ContractTypePreference;
  created_at: Date | string;
  updated_at: Date | string;
};

function mapUserPreference(row: UserPreferenceRow): UserPreference {
  return {
    id: row.id,
    userId: row.user_id,
    preferredRoles: toStringArray(row.preferred_roles),
    preferredKeywords: toStringArray(row.preferred_keywords),
    excludedKeywords: toStringArray(row.excluded_keywords),
    preferredIndustries: toStringArray(row.preferred_industries),
    minimumHourlyRateUsd: toNumber(row.minimum_hourly_rate_usd),
    minimumFixedBudgetUsd: toNumber(row.minimum_fixed_budget_usd),
    contractType: row.contract_type,
    createdAt: toDate(row.created_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export async function getPreferenceByUserId(userId: string) {
  const result = await query<UserPreferenceRow>(
    `SELECT * FROM user_preferences WHERE user_id = $1 LIMIT 1`,
    [userId]
  );

  return result.rows[0] ? mapUserPreference(result.rows[0]) : null;
}

export async function upsertPreference(input: {
  userId: string;
  preferredRoles: string[];
  minimumHourlyRateUsd: number | null;
  minimumFixedBudgetUsd: number | null;
  preferredKeywords: string[];
  excludedKeywords: string[];
  preferredIndustries: string[];
  contractType: ContractTypePreference;
}) {
  const result = await query<UserPreferenceRow>(
    `INSERT INTO user_preferences (
       id,
       user_id,
       preferred_roles,
       preferred_keywords,
       excluded_keywords,
       preferred_industries,
       minimum_hourly_rate_usd,
       minimum_fixed_budget_usd,
       contract_type
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id)
     DO UPDATE SET
       preferred_roles = EXCLUDED.preferred_roles,
       preferred_keywords = EXCLUDED.preferred_keywords,
       excluded_keywords = EXCLUDED.excluded_keywords,
       preferred_industries = EXCLUDED.preferred_industries,
       minimum_hourly_rate_usd = EXCLUDED.minimum_hourly_rate_usd,
       minimum_fixed_budget_usd = EXCLUDED.minimum_fixed_budget_usd,
       contract_type = EXCLUDED.contract_type,
       updated_at = NOW()
     RETURNING *`,
    [
      createId(),
      input.userId,
      input.preferredRoles,
      input.preferredKeywords,
      input.excludedKeywords,
      input.preferredIndustries,
      input.minimumHourlyRateUsd,
      input.minimumFixedBudgetUsd,
      input.contractType
    ]
  );

  return mapUserPreference(result.rows[0]);
}

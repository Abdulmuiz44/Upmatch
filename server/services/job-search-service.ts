import "server-only";

import { findUpworkConnectionByUserId } from "@/server/repos/connected-account-repo";
import { getFreelancerProfileByUserId } from "@/server/repos/freelancer-profile-repo";
import { getPreferenceByUserId } from "@/server/repos/preference-repo";
import { upsertJobsFromMarketplace } from "@/server/repos/job-repo";
import { upworkGraphqlRequest } from "@/lib/upwork/graphql-client";
import {
  buildMarketplaceSearchRequest,
  MARKETPLACE_JOB_SEARCH_QUERY,
  normalizeMarketplaceJobs,
  type UpworkJobSearchResponse
} from "@/lib/upwork/queries";

export async function ingestMarketplaceJobs(userId: string) {
  const [connection, preference, profile] = await Promise.all([
    findUpworkConnectionByUserId(userId),
    getPreferenceByUserId(userId),
    getFreelancerProfileByUserId(userId)
  ]);

  if (!connection?.encryptedAccessToken) {
    return {
      ok: false,
      reason: "UPWORK_NOT_CONNECTED"
    } as const;
  }

  if (!preference) {
    return {
      ok: false,
      reason: "PREFERENCES_REQUIRED"
    } as const;
  }

  const request = buildMarketplaceSearchRequest({
    preferredRoles: preference.preferredRoles,
    preferredKeywords: preference.preferredKeywords,
    minimumHourlyRateUsd: preference.minimumHourlyRateUsd
      ? Number(preference.minimumHourlyRateUsd)
      : null,
    minimumFixedBudgetUsd: preference.minimumFixedBudgetUsd
      ? Number(preference.minimumFixedBudgetUsd)
      : null,
    contractType: preference.contractType,
    profileTitle: profile?.profileTitle,
    profileSkills: profile?.skills
  });

  try {
    const data = await upworkGraphqlRequest<UpworkJobSearchResponse, { request: typeof request }>({
      query: MARKETPLACE_JOB_SEARCH_QUERY,
      variables: { request },
      encryptedAccessToken: connection.encryptedAccessToken,
      tenantId: connection.tenantId
    });

    const normalizedJobs = normalizeMarketplaceJobs(data);

    const result = await upsertJobsFromMarketplace(normalizedJobs);

    return {
      ok: true,
      ...result
    } as const;
  } catch (error) {
    return {
      ok: false,
      reason: "UPSTREAM_ERROR",
      errorMessage: error instanceof Error ? error.message : "Unknown job ingestion error"
    } as const;
  }
}

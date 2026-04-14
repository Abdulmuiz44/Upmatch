import "server-only";

import { findUpworkConnectionByUserId } from "@/server/repos/connected-account-repo";
import { upsertFreelancerProfile } from "@/server/repos/freelancer-profile-repo";
import {
  FREELANCER_PROFILE_QUERY,
  normalizeFreelancerProfile,
  type UpworkFreelancerProfileResponse
} from "@/lib/upwork/queries";
import { upworkGraphqlRequest } from "@/lib/upwork/graphql-client";

function logEvent(event: string, payload: Record<string, unknown>) {
  console.info(JSON.stringify({ event, ...payload }));
}

export async function syncFreelancerProfile(userId: string) {
  const connection = await findUpworkConnectionByUserId(userId);

  if (!connection?.encryptedAccessToken) {
    return {
      ok: false,
      reason: "UPWORK_NOT_CONNECTED"
    } as const;
  }

  try {
    logEvent("profile.sync.started", { userId });
    const data = await upworkGraphqlRequest<UpworkFreelancerProfileResponse>({
      query: FREELANCER_PROFILE_QUERY,
      encryptedAccessToken: connection.encryptedAccessToken,
      tenantId: connection.tenantId
    });

    const normalized = normalizeFreelancerProfile(data);

    if (!normalized) {
      return {
        ok: false,
        reason: "PROFILE_NOT_FOUND"
      } as const;
    }

    const profile = await upsertFreelancerProfile(userId, normalized);

    logEvent("profile.sync.succeeded", { userId, profileId: profile.id });
    return {
      ok: true,
      profile
    } as const;
  } catch (error) {
    logEvent("profile.sync.failed", { userId, message: error instanceof Error ? error.message : "Unknown profile sync error" });
    return {
      ok: false,
      reason: "UPSTREAM_ERROR",
      errorMessage: error instanceof Error ? error.message : "Unknown profile sync error"
    } as const;
  }
}

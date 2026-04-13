import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { findUpworkConnectionByUserId } from "@/server/repos/connected-account-repo";
import { ingestMarketplaceJobs } from "@/server/services/job-search-service";
import { rankJobsForUser } from "@/server/services/job-ranking-service";
import { syncFreelancerProfile } from "@/server/services/profile-sync-service";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const connection = await findUpworkConnectionByUserId(session.userId);
    if (!connection?.encryptedAccessToken) {
      return NextResponse.redirect(new URL("/dashboard?refresh=missing_connection", request.url));
    }

    const profileSync = await syncFreelancerProfile(session.userId);
    if (!profileSync.ok) {
      return NextResponse.redirect(new URL("/dashboard?refresh=profile_error", request.url));
    }

    const ingest = await ingestMarketplaceJobs(session.userId);
    if (!ingest.ok) {
      return NextResponse.redirect(new URL("/dashboard?refresh=ingest_error", request.url));
    }

    const ranking = await rankJobsForUser(session.userId);
    if (!ranking.ok) {
      return NextResponse.redirect(new URL("/dashboard?refresh=ranking_error", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard?refresh=success", request.url));
  } catch {
    return NextResponse.redirect(new URL("/dashboard?refresh=error", request.url));
  }
}

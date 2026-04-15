import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { SyncRunType } from "@/lib/db/types";
import { createSyncRun, markSyncRunFailed, markSyncRunRunning, markSyncRunSucceeded } from "@/server/repos/sync-run-repo";
import { cleanupExpiredJobs } from "@/server/services/job-retention-service";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const run = await createSyncRun({
    userId: session.userId,
    type: SyncRunType.CLEANUP,
    metadata: { triggeredBy: "manual-endpoint" }
  });

  await markSyncRunRunning(run.id);

  try {
    const summary = await cleanupExpiredJobs();
    await markSyncRunSucceeded(run.id, summary);

    return NextResponse.redirect(new URL("/dashboard?cleanup=success", request.url));
  } catch (error) {
    await markSyncRunFailed(
      run.id,
      error instanceof Error ? error.message : "Cleanup failed"
    );
    return NextResponse.redirect(new URL("/dashboard?cleanup=error", request.url));
  }
}

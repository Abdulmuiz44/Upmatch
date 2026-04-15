import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { findUpworkConnectionByUserId } from "@/server/repos/connected-account-repo";
import { enqueueSyncJob } from "@/server/queue/sync-queue";
import { startSyncRun } from "@/server/services/sync-orchestrator-service";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const connection = await findUpworkConnectionByUserId(session.userId);
  if (!connection?.encryptedAccessToken) {
    return NextResponse.redirect(new URL("/dashboard?refresh=missing_connection", request.url));
  }

  const run = await startSyncRun(session.userId, "full", {
    trigger: "dashboard_refresh"
  });

  const queueResult = await enqueueSyncJob({
    userId: session.userId,
    type: "full",
    runId: run.id,
    immediateFallback: request.headers.get("x-sync-mode") === "inline"
  });

  const refreshState = queueResult.enqueued ? "queued" : "success";
  return NextResponse.redirect(new URL(`/dashboard?refresh=${refreshState}`, request.url));
}

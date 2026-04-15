import "server-only";

import { type JsonValue, SyncRunStatus, SyncRunType } from "@/lib/db/types";
import {
  createSyncRun,
  getLatestSyncRun,
  markSyncRunFailed,
  markSyncRunRunning,
  markSyncRunSucceeded
} from "@/server/repos/sync-run-repo";
import { ingestMarketplaceJobs } from "@/server/services/job-search-service";
import { rankJobsForUser } from "@/server/services/job-ranking-service";
import { syncFreelancerProfile } from "@/server/services/profile-sync-service";

export type SyncPipelineType = "profile" | "ingest" | "rank" | "full";

function logEvent(event: string, payload: Record<string, unknown>) {
  console.info(JSON.stringify({ event, ...payload }));
}

export async function startSyncRun(userId: string, type: SyncPipelineType, metadata?: JsonValue) {
  return createSyncRun({
    userId,
    type:
      type === "profile"
        ? SyncRunType.PROFILE_SYNC
        : type === "ingest"
          ? SyncRunType.JOB_INGEST
          : type === "rank"
            ? SyncRunType.JOB_RANK
            : SyncRunType.FULL_REFRESH,
    status: SyncRunStatus.QUEUED,
    metadata
  });
}

export async function runSyncPipeline(input: { userId: string; type: SyncPipelineType; runId: string }) {
  await markSyncRunRunning(input.runId);
  logEvent("sync.run.started", input);

  try {
    if (input.type === "profile" || input.type === "full") {
      const profile = await syncFreelancerProfile(input.userId);
      if (!profile.ok) {
        throw new Error(`Profile sync failed: ${profile.reason}`);
      }
    }

    if (input.type === "ingest" || input.type === "full") {
      const ingest = await ingestMarketplaceJobs(input.userId);
      if (!ingest.ok) {
        throw new Error(`Ingest failed: ${ingest.reason}`);
      }
    }

    if (input.type === "rank" || input.type === "full") {
      const ranking = await rankJobsForUser(input.userId);
      if (!ranking.ok) {
        throw new Error(`Rank failed: ${ranking.reason}`);
      }
    }

    await markSyncRunSucceeded(input.runId, {
      completedBy: "sync-orchestrator",
      pipeline: input.type
    });
    logEvent("sync.run.succeeded", input);
    return { ok: true } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await markSyncRunFailed(input.runId, message);
    logEvent("sync.run.failed", { ...input, message });
    return {
      ok: false,
      errorMessage: message
    } as const;
  }
}

export function getSyncStatus(userId: string) {
  return getLatestSyncRun(userId);
}

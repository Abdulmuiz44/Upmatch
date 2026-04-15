import "server-only";

import { SyncRunType } from "@/lib/db/types";

import { runSyncPipeline, type SyncPipelineType } from "@/server/services/sync-orchestrator-service";

let inFlight = false;
const queue: Array<{ userId: string; type: SyncPipelineType; runId: string }> = [];

async function flush() {
  if (inFlight) return;
  const next = queue.shift();
  if (!next) return;

  inFlight = true;
  try {
    await runSyncPipeline(next);
  } finally {
    inFlight = false;
    if (queue.length > 0) {
      setTimeout(() => {
        void flush();
      }, 20);
    }
  }
}

export async function enqueueSyncJob(input: {
  userId: string;
  type: SyncPipelineType;
  runId: string;
  immediateFallback?: boolean;
}) {
  const canQueue = typeof setTimeout === "function";

  if (!canQueue || input.immediateFallback) {
    await runSyncPipeline({ userId: input.userId, type: input.type, runId: input.runId });
    return { enqueued: false } as const;
  }

  queue.push({ userId: input.userId, type: input.type, runId: input.runId });
  setTimeout(() => {
    void flush();
  }, 10);

  return { enqueued: true } as const;
}

export function mapSyncTypeToRunType(type: SyncPipelineType): SyncRunType {
  switch (type) {
    case "profile":
      return SyncRunType.PROFILE_SYNC;
    case "ingest":
      return SyncRunType.JOB_INGEST;
    case "rank":
      return SyncRunType.JOB_RANK;
    default:
      return SyncRunType.FULL_REFRESH;
  }
}

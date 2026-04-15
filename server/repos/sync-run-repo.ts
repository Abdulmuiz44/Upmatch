import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate, toJson } from "@/lib/db/row";
import { type JsonValue, SyncRunStatus, SyncRunType, type SyncRun } from "@/lib/db/types";

type SyncRunRow = {
  id: string;
  user_id: string;
  type: SyncRunType;
  status: SyncRunStatus;
  started_at: Date | string | null;
  completed_at: Date | string | null;
  error_message: string | null;
  metadata: SyncRun["metadata"];
  created_at: Date | string;
  updated_at: Date | string;
};

function mapSyncRun(row: SyncRunRow): SyncRun {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    status: row.status,
    startedAt: toDate(row.started_at),
    completedAt: toDate(row.completed_at),
    errorMessage: row.error_message,
    metadata: toJson(row.metadata),
    createdAt: toDate(row.created_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export function createSyncRun(input: {
  userId: string;
  type: SyncRunType;
  status?: SyncRunStatus;
  metadata?: JsonValue;
}) {
  return query<SyncRunRow>(
    `INSERT INTO sync_runs (id, user_id, type, status, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [createId(), input.userId, input.type, input.status ?? SyncRunStatus.QUEUED, input.metadata ?? null]
  ).then((result) => mapSyncRun(result.rows[0]));
}

export function markSyncRunRunning(id: string) {
  return query<SyncRunRow>(
    `UPDATE sync_runs
     SET status = $2, started_at = NOW(), error_message = NULL, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, SyncRunStatus.RUNNING]
  ).then((result) => mapSyncRun(result.rows[0]));
}

export function markSyncRunSucceeded(id: string, metadata?: JsonValue) {
  return query<SyncRunRow>(
    `UPDATE sync_runs
     SET status = $2, completed_at = NOW(), metadata = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, SyncRunStatus.SUCCEEDED, metadata ?? null]
  ).then((result) => mapSyncRun(result.rows[0]));
}

export function markSyncRunFailed(id: string, errorMessage: string) {
  return query<SyncRunRow>(
    `UPDATE sync_runs
     SET status = $2, completed_at = NOW(), error_message = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, SyncRunStatus.FAILED, errorMessage]
  ).then((result) => mapSyncRun(result.rows[0]));
}

export function getLatestSyncRun(userId: string) {
  return query<SyncRunRow>(
    `SELECT * FROM sync_runs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId]
  ).then((result) => (result.rows[0] ? mapSyncRun(result.rows[0]) : null));
}

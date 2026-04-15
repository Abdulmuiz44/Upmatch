import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate } from "@/lib/db/row";
import { JobUserStateType, type JobUserState } from "@/lib/db/types";

type JobUserStateRow = {
  id: string;
  user_id: string;
  job_id: string;
  state: JobUserStateType;
  notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function mapJobUserState(row: JobUserStateRow): JobUserState {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    state: row.state,
    notes: row.notes,
    createdAt: toDate(row.created_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export async function upsertJobUserState(input: {
  userId: string;
  jobId: string;
  state: JobUserStateType;
  notes?: string | null;
}) {
  const result = await query<JobUserStateRow>(
    `INSERT INTO job_user_states (id, user_id, job_id, state, notes)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, job_id)
     DO UPDATE SET
       state = EXCLUDED.state,
       notes = EXCLUDED.notes,
       updated_at = NOW()
     RETURNING *`,
    [createId(), input.userId, input.jobId, input.state, input.notes ?? null]
  );

  return mapJobUserState(result.rows[0]);
}

export async function getJobUserState(userId: string, jobId: string) {
  const result = await query<JobUserStateRow>(
    `SELECT * FROM job_user_states WHERE user_id = $1 AND job_id = $2 LIMIT 1`,
    [userId, jobId]
  );

  return result.rows[0] ? mapJobUserState(result.rows[0]) : null;
}

export async function getDismissedJobIds(userId: string) {
  const states = await query<{ job_id: string }>(
    `SELECT job_id
     FROM job_user_states
     WHERE user_id = $1 AND state = $2`,
    [userId, JobUserStateType.DISMISSED]
  );

  return states.rows.map((state) => state.job_id);
}

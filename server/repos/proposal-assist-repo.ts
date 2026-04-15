import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate, toStringArray } from "@/lib/db/row";
import type { ProposalAssist } from "@/lib/db/types";

type ProposalAssistRow = {
  id: string;
  user_id: string;
  job_id: string;
  opening_angle: string | null;
  key_proof_points: string[] | null;
  risks_to_address: string[] | null;
  client_questions: string[] | null;
  tone_guidance: string | null;
  generated_at: Date | string;
  updated_at: Date | string;
};

function mapProposalAssist(row: ProposalAssistRow): ProposalAssist {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    openingAngle: row.opening_angle,
    keyProofPoints: toStringArray(row.key_proof_points),
    risksToAddress: toStringArray(row.risks_to_address),
    clientQuestions: toStringArray(row.client_questions),
    toneGuidance: row.tone_guidance,
    generatedAt: toDate(row.generated_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export async function getProposalAssist(userId: string, jobId: string) {
  const result = await query<ProposalAssistRow>(
    `SELECT * FROM proposal_assists WHERE user_id = $1 AND job_id = $2 LIMIT 1`,
    [userId, jobId]
  );

  return result.rows[0] ? mapProposalAssist(result.rows[0]) : null;
}

export async function upsertProposalAssist(input: {
  userId: string;
  jobId: string;
  openingAngle: string | null;
  keyProofPoints: string[];
  risksToAddress: string[];
  clientQuestions: string[];
  toneGuidance: string | null;
}) {
  const result = await query<ProposalAssistRow>(
    `INSERT INTO proposal_assists (
       id,
       user_id,
       job_id,
       opening_angle,
       key_proof_points,
       risks_to_address,
       client_questions,
       tone_guidance,
       generated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (user_id, job_id)
     DO UPDATE SET
       opening_angle = EXCLUDED.opening_angle,
       key_proof_points = EXCLUDED.key_proof_points,
       risks_to_address = EXCLUDED.risks_to_address,
       client_questions = EXCLUDED.client_questions,
       tone_guidance = EXCLUDED.tone_guidance,
       generated_at = NOW(),
       updated_at = NOW()
     RETURNING *`,
    [
      createId(),
      input.userId,
      input.jobId,
      input.openingAngle,
      input.keyProofPoints,
      input.risksToAddress,
      input.clientQuestions,
      input.toneGuidance
    ]
  );

  return mapProposalAssist(result.rows[0]);
}
